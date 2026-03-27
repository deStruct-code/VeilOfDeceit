import type { StatusEffect } from './card';
export type BossActionType = 'attack' | 'status' | 'attack_status';
export type BossSpecialType = 'burn_cards' | 'swap_hands' | 'steal_energy' | 'resurrect';
export type BossActionKind = BossActionType | BossSpecialType;
export interface BossAction {
    kind: BossActionKind;
    label: string;
    target: 'player-1' | 'player-2' | 'both' | 'random';
    damage?: number;
    status?: {
        type: StatusEffect['type'];
        stacks: number;
    };
    count?: number;
}
export interface BossPhase {
    phase: number;
    hpThreshold: number;
    label: string;
    actionPool: BossAction[];
    passiveEffect?: string;
}
export interface BossDefinition {
    id: string;
    name: string;
    lore: string;
    maxHp: number;
    phases: BossPhase[];
    openingAction: BossAction;
    spawnMessage: string;
}
export interface BossState {
    definitionId: string;
    name: string;
    hp: number;
    maxHp: number;
    phase: number;
    statuses: StatusEffect[];
    nextAction: BossAction;
}
//# sourceMappingURL=boss.d.ts.map