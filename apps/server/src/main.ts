import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import http from "http";
import { WebSocketServer } from "ws";
import type { WebSocket, RawData } from "ws";

import { env } from "./config/env";
import { clone, createInitialGameState, resolveFullTurn } from "./game/gameLogic";
import { db, runMigration } from "./config/db";
import { gameRepository } from "./modules/game/game.repository";
import type { GameState } from "./game/types";

const app = express();

const clientDistPath = path.resolve(__dirname, "../../client/dist");
const hasClientBuild = fs.existsSync(clientDistPath);

// ─────────────────────────────────────────────────────────────────────────────

type RoomCode = string;
type PlayerId = string;

type ClientInfo = {
    ws: WebSocket;
    playerId: PlayerId;
};

const rooms = new Map<RoomCode, Map<PlayerId, ClientInfo>>();
const roomSlots = new Map<
    RoomCode,
    Map<PlayerId, "player-1" | "player-2">
>();
const playerNames = new Map<PlayerId, string>();

function broadcast(roomCode: RoomCode, data: unknown) {
    const room = rooms.get(roomCode);
    if (!room) return;

    const payload = JSON.stringify(data);

    for (const client of room.values()) {
        if (client.ws.readyState === client.ws.OPEN) {
            client.ws.send(payload);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bot: выбирает случайные карты в рамках энергии

function submitBotAction(game: GameState): void {
    const bot = game.players.find(p => p.id === "player-2");
    if (!bot || bot.submitted) return;

    const selected: string[] = [];
    let energy = bot.energy;

    // Перемешиваем руку случайно
    const shuffled = [...bot.hand].sort(() => Math.random() - 0.5);

    for (const card of shuffled) {
        if (card.cost <= energy) {
            selected.push(card.id);
            energy -= card.cost;
        }
    }

    bot.selectedCardId = selected as unknown as string[];
    bot.submitted = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORS

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", env.CLIENT_URL);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }

    next();
});

app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Health

app.get("/api/health", async (_req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ status: "ok", env: env.NODE_ENV, db: "connected" });
    } catch {
        res.status(503).json({ status: "error", db: "disconnected" });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Room info

app.get("/api/rooms/:code", (req, res) => {
    const code = String(req.params.code || "").toUpperCase();
    const room = rooms.get(code);

    res.json({
        code,
        playerCount: room ? room.size : 0,
        capacity: 2,
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Game fetch

app.get("/api/game/:id", async (req, res) => {
    const id = String(req.params.id || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);

    try {
        const game = await gameRepository.findById(id);

        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }

        res.json(game);
    } catch (err) {
        console.error("[GET /api/game]", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Solo game: создать игру с ботом

app.post("/api/game/:id/solo", async (req, res) => {
    const id = String(req.params.id || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);

    if (!id || id.length !== 6) {
        res.status(400).json({ error: "Invalid game id" });
        return;
    }

    const playerName = String(req.body?.playerName || "").trim().slice(0, 24) || "Player";

    try {
        const existing = await gameRepository.findById(id);
        if (existing) {
            res.json(existing);
            return;
        }

        const state = createInitialGameState(id, playerName, "Bot");
        state.isSolo = true;

        await gameRepository.save(state);
        res.json(state);
    } catch (err) {
        console.error("[POST /api/game/solo]", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTION

app.post("/api/game/:id/action", async (req, res) => {
    const id = String(req.params.id || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);

    try {
        const game = await gameRepository.findById(id);

        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }

        const playerId = String(req.body?.playerId || "").trim() as
            | "player-1"
            | "player-2";

        const cardIds: string[] = Array.isArray(req.body?.cardIds)
            ? req.body.cardIds.map((id: unknown) => String(id).trim()).filter(Boolean)
            : [];

        const player = game.players.find((p) => p.id === playerId);

        if (!player) {
            res.status(400).json({ error: "Invalid playerId" });
            return;
        }

        if (player.submitted) {
            res.json(game);
            return;
        }

        // Валидация карт
        const validCardIds = cardIds.filter(id => player.hand.some(c => c.id === id));

        const totalCost = validCardIds.reduce((sum, id) => {
            const card = player.hand.find(c => c.id === id);
            return sum + (card?.cost ?? 0);
        }, 0);

        if (totalCost > player.energy) {
            res.status(400).json({ error: "Not enough energy" });
            return;
        }

        player.selectedCardId = validCardIds as unknown as string[];
        player.submitted = true;

        // ── Если соло — бот ходит сразу после игрока ──────────────────────────
        if (game.isSolo) {
            submitBotAction(game);
        }

        let next: GameState;

        if (game.players.every((p) => p.submitted)) {
            next = resolveFullTurn(clone(game));
            next.isSolo = game.isSolo; // сохраняем флаг после resolve
            await gameRepository.saveResult(next);
        } else {
            next = game;
        }

        await gameRepository.save(next);

        res.json(next);
    } catch (err) {
        console.error("[POST /api/game/action]", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESET

app.post("/api/game/:id/reset", async (req, res) => {
    const id = String(req.params.id || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);

    if (!id || id.length !== 6) {
        res.status(400).json({ error: "Invalid game id" });
        return;
    }

    try {
        // Сохраняем isSolo при рестарте
        const existing = await gameRepository.findById(id);
        const isSolo = existing?.isSolo ?? false;

        const playerName = existing?.players[0]?.name ?? "Player";
        const next = createInitialGameState(id, playerName, isSolo ? "Bot" : (existing?.players[1]?.name ?? "Player 2"));
        next.isSolo = isSolo;

        await gameRepository.save(next);
        res.json(next);
    } catch (err) {
        console.error("[POST /api/game/reset]", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// STATIC

if (hasClientBuild) {
    app.use(express.static(clientDistPath));

    app.get("*", (req, res) => {
        if (req.path.startsWith("/api")) {
            res.status(404).json({ error: "API route not found" });
            return;
        }

        res.sendFile(path.join(clientDistPath, "index.html"));
    });
} else {
    app.get("/", (_req, res) => {
        res.json({
            status: "ok",
            env: env.NODE_ENV,
            message: "Client build not found. Build apps/client first.",
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
    let joinedRoom: RoomCode | null = null;
    let joinedPlayerId: PlayerId | null = null;

    ws.on("message", async (raw: RawData) => {
        let msg: any;

        try {
            msg = JSON.parse(String(raw));
        } catch {
            ws.send(JSON.stringify({ type: "error", message: "Invalid JSON message." }));
            return;
        }

        if (msg?.type !== "join") {
            ws.send(JSON.stringify({ type: "error", message: "Unknown message type." }));
            return;
        }

        const roomCode = String(msg.roomCode || "")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6);

        const playerId = String(msg.playerId || "").trim();
        const playerName =
            String(msg.playerName || "").trim().slice(0, 24) || "Shadow";

        if (roomCode.length !== 6) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid room code." }));
            ws.close();
            return;
        }

        if (!playerId) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid playerId." }));
            ws.close();
            return;
        }

        const existingRoom = rooms.get(roomCode) ?? new Map<PlayerId, ClientInfo>();

        if (!existingRoom.has(playerId) && existingRoom.size >= 2) {
            ws.send(JSON.stringify({ type: "error", message: "Room is full." }));
            ws.close();
            return;
        }

        existingRoom.set(playerId, { ws, playerId });
        rooms.set(roomCode, existingRoom);

        joinedRoom = roomCode;
        joinedPlayerId = playerId;

        const slots =
            roomSlots.get(roomCode) ??
            new Map<PlayerId, "player-1" | "player-2">();

        if (!slots.has(playerId)) {
            const taken = new Set(slots.values());
            const slot: "player-1" | "player-2" = taken.has("player-1")
                ? "player-2"
                : "player-1";

            slots.set(playerId, slot);
            roomSlots.set(roomCode, slots);
        }

        const slot = slots.get(playerId)!;
        playerNames.set(playerId, playerName);

        ws.send(
            JSON.stringify({
                type: "joined",
                roomCode,
                playerCount: existingRoom.size,
                slot,
            }),
        );

        if (existingRoom.size >= 2) {
            const existing = await gameRepository.findById(roomCode);

            if (!existing) {
                const slotMap = roomSlots.get(roomCode) ?? new Map();

                const nameFor = (s: string) => {
                    for (const [pid, slot] of slotMap) {
                        if (slot === s) return playerNames.get(pid) ?? s;
                    }
                    return s;
                };

                await gameRepository.save(
                    createInitialGameState(
                        roomCode,
                        nameFor("player-1"),
                        nameFor("player-2"),
                    ),
                );
            }

            broadcast(roomCode, {
                type: "ready",
                roomCode,
                playerCount: existingRoom.size,
            });
        }
    });

    ws.on("close", () => {
        if (!joinedRoom || !joinedPlayerId) return;

        const room = rooms.get(joinedRoom);
        if (!room) return;

        room.delete(joinedPlayerId);

        if (room.size === 0) {
            rooms.delete(joinedRoom);
            roomSlots.delete(joinedRoom);
        } else {
            broadcast(joinedRoom, {
                type: "joined",
                roomCode: joinedRoom,
                playerCount: room.size,
            });
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Background timer loop — форсирует skip по turnDeadline

setInterval(async () => {
    try {
        const { rows } = await db.query<{ id: string; state: GameState }>(
            `SELECT id, state FROM games
             WHERE (state->>'phase') = 'action'
               AND (state->>'turnDeadline') IS NOT NULL
               AND (state->>'turnDeadline')::bigint < $1`,
            [Date.now()]
        );

        for (const row of rows) {
            const game = row.state;

            for (const player of game.players) {
                if (!player.submitted) {
                    // Бот или живой игрок — одинаково: skip
                    player.selectedCardId = [] as unknown as string[];
                    player.submitted = true;
                }
            }

            const next = resolveFullTurn(clone(game));
            next.isSolo = game.isSolo;
            await gameRepository.save(next);
        }
    } catch (err) {
        console.error("[timer loop]", err);
    }
}, 1000);

// ─────────────────────────────────────────────────────────────────────────────

async function start() {
    try {
        await runMigration();
    } catch (err) {
        console.error("[db] Migration failed:", err);
        process.exit(1);
    }

    server.listen(env.PORT, () => {
        console.log(`Server started on port ${env.PORT}`);
        console.log(`CORS allowed for: ${env.CLIENT_URL}`);
    });
}

start();