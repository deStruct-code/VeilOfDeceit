import type { WebSocketServer, WebSocket, RawData } from 'ws'
import type { IncomingMessage } from 'http'
import { db } from '../../config/db'
import { roomRepository } from '../room/room.repository'
import { gameRepository } from '../game/game.repository'
import { createInitialGameState } from '../../game/gameLogic'

const SESSION_COOKIE = 'veil_session'

function parseCookieHeader(header: string): Record<string, string> {
    return Object.fromEntries(
        header.split(';').map(pair => {
            const [key, ...val] = pair.trim().split('=')
            return [key.trim(), decodeURIComponent(val.join('=').trim())]
        })
    )
}

// in-memory: только активные WS-соединения (ephemeral по природе)
const activeConnections = new Map<string, Map<string, WebSocket>>()

function broadcast(roomCode: string, data: unknown) {
    const room = activeConnections.get(roomCode)
    if (!room) return
    const payload = JSON.stringify(data)
    for (const ws of room.values()) {
        if (ws.readyState === ws.OPEN) ws.send(payload)
    }
}

/** Получить user_id из сессионной cookie запроса */
async function getUserIdFromRequest(req: IncomingMessage): Promise<number | null> {
    const cookieHeader = req.headers.cookie ?? ''
    const cookies = parseCookieHeader(cookieHeader)
    const token = cookies[SESSION_COOKIE]
    if (!token) return null

    try {
        const { rows } = await db.query<{ user_id: number }>(
            `SELECT user_id FROM sessions
             WHERE token = $1 AND expires_at > now()`,
            [token],
        )
        return rows[0]?.user_id ?? null
    } catch {
        return null
    }
}

export function setupLobbyWS(wss: WebSocketServer) {
    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        let joinedRoom: string | null = null
        let joinedPlayerId: string | null = null

        ws.on('message', async (raw: RawData) => {
            let msg: any
            try {
                msg = JSON.parse(String(raw))
            } catch {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON message.' }))
                return
            }

            if (msg?.type !== 'join') {
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type.' }))
                return
            }

            const roomCode = String(msg.roomCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
            const playerId = String(msg.playerId || '').trim()
            const playerName = String(msg.playerName || '').trim().slice(0, 24) || 'Shadow'
            const cardBack = String(msg.cardBackId || 'veil-mandala').trim()

            if (roomCode.length !== 6) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid room code.' }))
                ws.close(); return
            }
            if (!playerId) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid playerId.' }))
                ws.close(); return
            }

            const roomExists = await roomRepository.exists(roomCode)
            if (!roomExists) {
                ws.send(JSON.stringify({ type: 'error', message: 'Комната не найдена, попробуйте снова.' }))
                ws.close(); return
            }

            const players = await roomRepository.getPlayers(roomCode)
            const alreadyIn = players.some(p => p.playerId === playerId)
            if (!alreadyIn && players.length >= 2) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room is full.' }))
                ws.close(); return
            }

            // Определяем user_id — null для гостей
            const userId = await getUserIdFromRequest(req)

            const slot = await roomRepository.addPlayer(roomCode, playerId, playerName, cardBack, userId)
            await roomRepository.setStatus(roomCode, 'open')

            if (!activeConnections.has(roomCode)) activeConnections.set(roomCode, new Map())
            activeConnections.get(roomCode)!.set(playerId, ws)

            joinedRoom = roomCode
            joinedPlayerId = playerId

            const updatedPlayers = await roomRepository.getPlayers(roomCode)
            const ally = updatedPlayers.find(p => p.playerId !== playerId)

            ws.send(JSON.stringify({
                type: 'joined',
                roomCode,
                playerCount: updatedPlayers.length,
                slot,
                allyCardBackId: ally?.cardBack,
            }))

            if (updatedPlayers.length >= 2) {
                const existing = await gameRepository.findById(roomCode)
                if (!existing) {
                    const p1 = updatedPlayers.find(p => p.slot === 'player-1')!
                    const p2 = updatedPlayers.find(p => p.slot === 'player-2')!
                    await gameRepository.save(
                        createInitialGameState(roomCode, p1.playerName, p2.playerName)
                    )
                }

                await roomRepository.setStatus(roomCode, 'started')

                for (const p of updatedPlayers) {
                    const pWs = activeConnections.get(roomCode)?.get(p.playerId)
                    if (!pWs || pWs.readyState !== pWs.OPEN) continue
                    const pAlly = updatedPlayers.find(q => q.playerId !== p.playerId)
                    pWs.send(JSON.stringify({
                        type: 'ready',
                        roomCode,
                        playerCount: updatedPlayers.length,
                        allyCardBackId: pAlly?.cardBack ?? 'veil-mandala',
                    }))
                }
            }
        })

        ws.on('close', async () => {
            if (!joinedRoom || !joinedPlayerId) return

            const room = activeConnections.get(joinedRoom)
            if (room) {
                room.delete(joinedPlayerId)
                if (room.size === 0) activeConnections.delete(joinedRoom)
            }

            await roomRepository.removePlayer(joinedRoom, joinedPlayerId)

            const remaining = await roomRepository.getPlayers(joinedRoom)
            if (remaining.length > 0) {
                broadcast(joinedRoom, {
                    type: 'joined',
                    roomCode: joinedRoom,
                    playerCount: remaining.length,
                })
            }
        })
    })
}
