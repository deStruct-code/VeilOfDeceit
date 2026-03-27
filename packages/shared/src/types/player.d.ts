import type { Card, StatusEffect } from './card';
export type PlayerSlot = 'player-1' | 'player-2';
export declare const MAX_BUFFS = 3;
export declare const MAX_DEBUFFS = 3;
export declare const BUFF_TYPES: readonly StatusEffect['type'][];
export declare const DEBUFF_TYPES: readonly StatusEffect['type'][];
export interface Player {
    id: PlayerSlot;
    name: string;
    hp: number;
    maxHp: number;
    shield: number;
    energy: number;
    maxEnergy: number;
    hand: Card[];
    handLimit: number;
    deck: Card[];
    discardPile: Card[];
    statuses: StatusEffect[];
    selectedCardId: string[];
    submitted: boolean;
    isAlive: boolean;
}
export declare const PLAYER_DEFAULTS: {
    readonly maxHp: 50;
    readonly handLimit: 7;
    readonly startCards: 3;
    readonly maxEnergy: 10;
};
//# sourceMappingURL=player.d.ts.map