import type {Card, StatusEffect} from "./card";
import type {Player} from "./player";
import type {BossState} from "./boss";

// ─── Game phase ───────────────────────────────────────────────────────────────

export type GamePhase =
    | "action" // игроки выбирают карты
    | "reveal" // карты вскрыты, применяются эффекты
    | "boss_attack" // босс атакует
    | "new_cards" // раздача новых карт
    | "defeat" // оба игрока мертвы
    | "victory"; // босс побеждён

// ─── Reveal ───────────────────────────────────────────────────────────────────

export interface RevealEntry {
    playerId: string;
    card: Card;
    damageDealt?: number;
    shieldGained?: number;
    statusApplied?: StatusEffect;
}

// ─── Log ──────────────────────────────────────────────────────────────────────

export interface LogEntry {
    turn: number;
    text: string;
    type?: "damage" | "status" | "boss" | "system";
}

// ─── GameState ────────────────────────────────────────────────────────────────

export interface GameState {
    id: string;
    phase: GamePhase;
    turn: number;
    boss: BossState;
    players: [Player, Player];
    /**
     * Общая колода обоих игроков — единственный источник карт.
     * Оба игрока тянут из неё. При старте = 50 − 4 стартовые карты = 46.
     */
    sharedDeck: Card[];
    /** Общий сброс — когда sharedDeck пустеет, перемешивается в неё. */
    sharedDiscardPile: Card[];
    log: LogEntry[];
    lastReveal?: RevealEntry[];
    winner?: "players" | "boss";
    turnDeadline?: number | null;
    isSolo?: boolean;
}
