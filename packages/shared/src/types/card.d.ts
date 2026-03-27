export type CardType = 'attack' | 'defense' | 'support' | 'special' | 'hidden';
export type StatusType = 'poison' | 'weakness' | 'strength' | 'regen' | 'shield' | 'bleed';
export interface StatusEffect {
    type: StatusType;
    stacks: number;
}
export interface Card {
    id: string;
    baseId: string;
    name: string;
    type: CardType;
    value: number;
    cost: number;
    effect?: string;
    statusEffect?: {
        type: StatusType;
        stacks: number;
    };
}
//# sourceMappingURL=card.d.ts.map