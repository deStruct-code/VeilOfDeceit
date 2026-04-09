import type { Card } from '@veil/shared'

// Единый источник правды для всех карт игры.
// Отсюда собирается общая колода на двоих игроков.

export const CARD_TEMPLATES: Omit<Card, 'id'>[] = [
    { baseId: 'slash',       name: 'Slash',       type: 'attack',  value: 8,  cost: 1 },
    { baseId: 'heavy',       name: 'Heavy Blow',  type: 'attack',  value: 14, cost: 2 },
    {
        baseId: 'bleed',
        name: 'Bleed',
        type: 'attack',
        value: 5,
        cost: 1,
        effect: 'Poison ×2',
        statusEffect: { type: 'poison', stacks: 2 },
    },
    { baseId: 'parry',       name: 'Parry',       type: 'defense', value: 6,  cost: 1 },
    { baseId: 'shield_wall', name: 'Shield Wall', type: 'defense', value: 12, cost: 2 },
    {
        baseId: 'empower',
        name: 'Empower',
        type: 'support',
        value: 0,
        cost: 1,
        effect: 'Ally +4 dmg next card',
    },
    {
        baseId: 'weaken',
        name: 'Weaken',
        type: 'special',
        value: 0,
        cost: 1,
        effect: 'Boss: Weakness ×2',
        statusEffect: { type: 'weakness', stacks: 2 },
    },
    {
        baseId: 'surge',
        name: 'Surge',
        type: 'attack',
        value: 6,
        cost: 0,
        effect: 'Free card',
    },
]

// Количество копий каждой карты в общей колоде
export const CARDS_PER_TEMPLATE = 2