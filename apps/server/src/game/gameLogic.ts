import type { Card, GameState, Player, StatusEffect, BossState } from "@veil/shared";
import { PLAYER_DEFAULTS } from "@veil/shared";
import { createBossState, pickNextBossAction, checkPhaseTransition } from '../bosses/bossRegistry';

// ─── Карты-шаблоны ────────────────────────────────────────────────────────────

export const CARD_TEMPLATES: Omit<Card, "id">[] = [
    { baseId: "slash", name: "Slash", type: "attack", value: 8, cost: 1 },
    { baseId: "heavy", name: "Heavy Blow", type: "attack", value: 14, cost: 2 },
    {
        baseId: "bleed",
        name: "Bleed",
        type: "attack",
        value: 5,
        cost: 1,
        effect: "Poison ×2",
        statusEffect: { type: "poison", stacks: 2 },
    },
    { baseId: "parry", name: "Parry", type: "defense", value: 6, cost: 1 },
    {
        baseId: "shield_wall",
        name: "Shield Wall",
        type: "defense",
        value: 12,
        cost: 2,
    },
    {
        baseId: "empower",
        name: "Empower",
        type: "support",
        value: 0,
        cost: 1,
        effect: "Ally +4 dmg next card",
    },
    {
        baseId: "weaken",
        name: "Weaken",
        type: "special",
        value: 0,
        cost: 1,
        effect: "Boss: Weakness ×2",
        statusEffect: { type: "weakness", stacks: 2 },
    },
    {
        baseId: "surge",
        name: "Surge",
        type: "attack",
        value: 6,
        cost: 0,
        effect: "Free card",
    },
];

// ─── Deck ─────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function makeDeck(): Card[] {
    const cards: Card[] = [];

    for (const tpl of CARD_TEMPLATES) {
        for (let copy = 0; copy < 2; copy++) {
            cards.push({
                ...tpl,
                id: `${tpl.baseId}_${copy}`,
            });
        }
    }

    return shuffle(cards);
}

// ─── Добор карт ───────────────────────────────────────────────────────────────

function drawCards(player: Player, count: number): void {
    for (let i = 0; i < count; i++) {
        if (player.hand.length >= player.handLimit) break;

        if (player.deck.length === 0) {
            if (player.discardPile.length === 0) break;
            player.deck = shuffle(player.discardPile);
            player.discardPile = [];
        }

        const card = player.deck.pop()!;
        player.hand.push({
            ...card,
            id: `${card.baseId}_${Date.now()}_${i}`,
        });
    }
}

// ─── Энергия ──────────────────────────────────────────────────────────────────

function energyForTurn(turn: number, maxEnergy: number): number {
    return Math.min(turn, maxEnergy);
}

// ─── Utils ─────────────────────────────────────────────────────────────────────

function addLog(
    s: GameState,
    text: string,
    type: GameState["log"][0]["type"] = "system",
) {
    s.log.push({ turn: s.turn, text, type });
}

// ─── Статусы ──────────────────────────────────────────────────────────────────

function applyStatus(target: { statuses: StatusEffect[] }, status: StatusEffect) {
    const existing = target.statuses.find((s) => s.type === status.type);
    if (existing) {
        existing.stacks += status.stacks;
    } else {
        target.statuses.push({ ...status });
    }
}

// ─── Урон ─────────────────────────────────────────────────────────────────────

function applyDamage(player: Player, raw: number): number {
    const weakness =
        player.statuses.find((s) => s.type === "weakness")?.stacks ?? 0;

    const actual = raw + weakness * 2;

    const afterShield = Math.max(0, actual - player.shield);
    player.shield = Math.max(0, player.shield - actual);

    player.hp = Math.max(0, player.hp - afterShield);

    if (player.hp <= 0) player.isAlive = false;

    return afterShield;
}

// ─── Poison ───────────────────────────────────────────────────────────────────

function tickPoison(player: Player): number {
    const poison = player.statuses.find((s) => s.type === "poison");
    if (!poison) return 0;

    const dmg = poison.stacks * 2;
    player.hp = Math.max(0, player.hp - dmg);

    poison.stacks -= 1;

    if (poison.stacks <= 0) {
        player.statuses = player.statuses.filter((s) => s.type !== "poison");
    }

    if (player.hp <= 0) player.isAlive = false;

    return dmg;
}

// ─── Game init ────────────────────────────────────────────────────────────────

export function clone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}

export function createInitialGameState(
    gameId: string,
    name1 = 'Player 1',
    name2 = 'Player 2',
    bossId = 'hollow_lich',
): GameState {
    return {
        id: gameId,
        phase: 'action',
        turn: 1,
        boss: createBossState(bossId),
        players: [
            makePlayer('player-1', name1),
            makePlayer('player-2', name2),
        ],
        log: [
            { turn: 0, text: 'Darkness falls...', type: 'system' as const },
        ],
    };
}

function makePlayer(id: "player-1" | "player-2", name: string): Player {
    const deck = makeDeck();

    const player: Player & { _spentEnergy?: number } = {
        id,
        name,
        hp: PLAYER_DEFAULTS.maxHp,
        maxHp: PLAYER_DEFAULTS.maxHp,
        shield: 0,

        energy: 1,
        maxEnergy: PLAYER_DEFAULTS.maxEnergy,

        hand: [],
        handLimit: PLAYER_DEFAULTS.handLimit,

        deck,
        discardPile: [],

        statuses: [],

        selectedCardId: null as any,

        submitted: false,
        isAlive: true,

        _spentEnergy: 0,
    };

    drawCards(player, PLAYER_DEFAULTS.startCards);
    return player;
}

// ─── Main turn resolution ─────────────────────────────────────────────────────

export function resolveFullTurn(s: GameState): GameState {
    const [p1, p2] = s.players;

    // selectedCardId — массив id выбранных карт
    const p1Cards = p1.hand.filter(c => (p1.selectedCardId as unknown as string[]).includes(c.id));
    const p2Cards = p2.hand.filter(c => (p2.selectedCardId as unknown as string[]).includes(c.id));

    s.phase = "reveal";
    s.lastReveal = [];

    const playerCards: [Player, Card[], Player][] = [
        [p1, p1Cards, p2],
        [p2, p2Cards, p1],
    ];

    for (const [player, cards, other] of playerCards) {
        let spentEnergy = 0;

        for (const card of cards) {
            // Защитная проверка энергии
            if (spentEnergy + card.cost > player.energy) {
                addLog(s, `${player.name} cannot afford ${card.name}`, "system");
                continue;
            }
            spentEnergy += card.cost;

            const reveal: NonNullable<GameState["lastReveal"]>[0] = {
                playerId: player.id,
                card,
            };

        if (card.type === "attack") {
            const weakness =
                s.boss.statuses.find((st) => st.type === "weakness")?.stacks ??
                0;

            const dmg =
                card.value +
                weakness * 2 +
                ((player as any)._empowerBonus ?? 0);

            s.boss.hp = Math.max(0, s.boss.hp - dmg);

            reveal.damageDealt = dmg;

            addLog(
                s,
                `${player.name} plays ${card.name} — ${dmg} dmg`,
                "damage",
            );
        }

        if (card.type === "defense") {
            player.shield += card.value;

            reveal.shieldGained = card.value;

            addLog(
                s,
                `${player.name} gains ${card.value} shield`,
                "system",
            );
        }

        if (card.type === "support") {
            (other as any)._empowerBonus =
                ((other as any)._empowerBonus ?? 0) + 4;

            addLog(s, `${player.name} empowers ally`, "system");
        }

        if (card.type === "special" && card.statusEffect) {
            applyStatus(s.boss, card.statusEffect);

            reveal.statusApplied = card.statusEffect;

            addLog(
                s,
                `${player.name} applies ${card.statusEffect.type}`,
                "status",
            );
        }

            s.lastReveal!.push(reveal);
        } // for card
    } // for player

    (p1 as any)._empowerBonus = 0;
    (p2 as any)._empowerBonus = 0;

    if (s.boss.hp <= 0) {
        s.phase = "victory";
        addLog(s, "Victory!", "system");
        return s;
    }

    // ─── Boss turn ───────────────────────────────────────────────────────────

    const action = s.boss.nextAction;

    const targets =
        action.target === "both"
            ? [p1, p2]
            : action.target === "player-1"
              ? [p1]
              : [p2];

    if (action.kind === "attack" || action.kind === "attack_status") {
        for (const t of targets) {
            const dealt = applyDamage(t, action.damage ?? 0);
            addLog(
                s,
                `Boss hits ${t.name} for ${dealt}`,
                "boss",
            );
        }
    }

    if (
        (action.kind === "status" || action.kind === "attack_status") &&
        action.status
    ) {
        for (const t of targets) {
            applyStatus(t, action.status);

            addLog(
                s,
                `Boss applies ${action.status.type}`,
                "status",
            );
        }
    }

    // ─── New turn ────────────────────────────────────────────────────────────

    s.turn += 1;
    s.phase = "new_cards";

    for (const p of [p1, p2]) {
        const dmg = tickPoison(p);
        if (dmg) {
            addLog(s, `${p.name} takes ${dmg} poison`, "damage");
        }
    }

    if (p1.hp <= 0 && p2.hp <= 0) {
        s.phase = "defeat";
        addLog(s, "Defeat", "system");
        return s;
    }

    for (const p of [p1, p2]) {
        // Сбрасываем все сыгранные карты в дискард
        const played = p.selectedCardId as unknown as string[];
        for (const id of played) {
            const idx = p.hand.findIndex(c => c.id === id);
            if (idx !== -1) {
                p.discardPile.push(p.hand[idx]);
                p.hand.splice(idx, 1);
            }
        }
        // Тянем одну карту за ход
        drawCards(p, 1);

        p.selectedCardId = [] as unknown as string[];
        p.submitted = false;
        p.shield = 0;
        p.energy = energyForTurn(s.turn, p.maxEnergy);
    }

    // Проверяем переход фазы
    const newPhase = checkPhaseTransition(s.boss);
    if (newPhase) {
        s.boss.phase = newPhase.phase;
        addLog(s, `${s.boss.name}: ${newPhase.label}!`, 'boss');
    }
    s.boss.nextAction = pickNextBossAction(s.boss);

    s.phase = "action";
    return s;
}