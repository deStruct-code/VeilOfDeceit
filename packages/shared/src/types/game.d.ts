import type { Card, StatusEffect } from './card';
import type { Player } from './player';
import type { BossState } from './boss';
export type GamePhase = 'action' | 'reveal' | 'boss_attack' | 'new_cards' | 'defeat' | 'victory';
export interface RevealEntry {
    playerId: string;
    card: Card;
    damageDealt?: number;
    shieldGained?: number;
    statusApplied?: StatusEffect;
}
export interface LogEntry {
    turn: number;
    text: string;
    type?: 'damage' | 'status' | 'boss' | 'system';
}
export interface GameState {
    id: string;
    phase: GamePhase;
    turn: number;
    boss: BossState;
    players: [Player, Player];
    log: LogEntry[];
    lastReveal?: RevealEntry[];
    winner?: 'players' | 'boss';
}
//# sourceMappingURL=game.d.ts.map