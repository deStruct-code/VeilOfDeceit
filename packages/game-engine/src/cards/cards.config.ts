import type { Card } from '@veil/shared'

// Единый источник правды для всех карт игры.
// Отсюда собирается общая колода на двоих игроков.
// Ровно 50 уникальных записей, CARDS_PER_TEMPLATE = 1.

export const CARD_TEMPLATES: Omit<Card, 'id'>[] = [
  // ─── ATTACK ~18 ───────────────────────────────────────────────────────────
  { baseId: 'slash_01',        name: 'Slash #1',          type: 'attack',  value: 8,  cost: 1 },
  { baseId: 'slash_02',        name: 'Slash #2',          type: 'attack',  value: 8,  cost: 1 },
  { baseId: 'slash_03',        name: 'Slash #3',          type: 'attack',  value: 9,  cost: 1 },
  { baseId: 'heavy_04',        name: 'Heavy Blow #4',     type: 'attack',  value: 14, cost: 2 },
  { baseId: 'heavy_05',        name: 'Heavy Blow #5',     type: 'attack',  value: 14, cost: 2 },
  { baseId: 'heavy_06',        name: 'Heavy Blow #6',     type: 'attack',  value: 16, cost: 2 },
  {
    baseId: 'bleed_07',        name: 'Bleed #7',          type: 'attack',  value: 5,  cost: 1,
    effect: 'Poison x2',       statusEffect: { type: 'poison', stacks: 2 },
  },
  {
    baseId: 'bleed_08',        name: 'Bleed #8',          type: 'attack',  value: 6,  cost: 1,
    effect: 'Poison x3',       statusEffect: { type: 'poison', stacks: 3 },
  },
  { baseId: 'surge_09',        name: 'Surge #9',          type: 'attack',  value: 6,  cost: 0,
    effect: 'Free strike' },
  { baseId: 'surge_10',        name: 'Surge #10',         type: 'attack',  value: 7,  cost: 0,
    effect: 'Free strike' },
  { baseId: 'rend_11',         name: 'Rend #11',          type: 'attack',  value: 10, cost: 1 },
  { baseId: 'rend_12',         name: 'Rend #12',          type: 'attack',  value: 11, cost: 1 },
  { baseId: 'execute_13',      name: 'Execute #13',       type: 'attack',  value: 20, cost: 3 },
  { baseId: 'jab_14',          name: 'Jab #14',           type: 'attack',  value: 5,  cost: 0 },
  { baseId: 'jab_15',          name: 'Jab #15',           type: 'attack',  value: 5,  cost: 0 },
  {
    baseId: 'doom_16',         name: 'Doom Strike #16',   type: 'attack',  value: 12, cost: 2,
    effect: 'Weakness x1',     statusEffect: { type: 'weakness', stacks: 1 },
  },
  { baseId: 'ravage_17',       name: 'Ravage #17',        type: 'attack',  value: 18, cost: 3 },
  { baseId: 'cleave_18',       name: 'Cleave #18',        type: 'attack',  value: 13, cost: 2 },

  // ─── DEFENSE ~12 ──────────────────────────────────────────────────────────
  { baseId: 'parry_19',        name: 'Parry #19',         type: 'defense', value: 6,  cost: 1 },
  { baseId: 'parry_20',        name: 'Parry #20',         type: 'defense', value: 6,  cost: 1 },
  { baseId: 'parry_21',        name: 'Parry #21',         type: 'defense', value: 7,  cost: 1 },
  { baseId: 'shield_wall_22',  name: 'Shield Wall #22',   type: 'defense', value: 12, cost: 2 },
  { baseId: 'shield_wall_23',  name: 'Shield Wall #23',   type: 'defense', value: 12, cost: 2 },
  { baseId: 'shield_wall_24',  name: 'Shield Wall #24',   type: 'defense', value: 14, cost: 2 },
  { baseId: 'iron_skin_25',    name: 'Iron Skin #25',     type: 'defense', value: 8,  cost: 1 },
  { baseId: 'iron_skin_26',    name: 'Iron Skin #26',     type: 'defense', value: 9,  cost: 1 },
  { baseId: 'fortify_27',      name: 'Fortify #27',       type: 'defense', value: 16, cost: 3 },
  { baseId: 'dodge_28',        name: 'Dodge #28',         type: 'defense', value: 5,  cost: 0 },
  { baseId: 'dodge_29',        name: 'Dodge #29',         type: 'defense', value: 5,  cost: 0 },
  { baseId: 'bulwark_30',      name: 'Bulwark #30',       type: 'defense', value: 20, cost: 3 },

  // ─── SUPPORT ~10 ──────────────────────────────────────────────────────────
  {
    baseId: 'empower_31',      name: 'Empower #31',       type: 'support', value: 0,  cost: 1,
    effect: 'Ally +4 dmg next card',
  },
  {
    baseId: 'empower_32',      name: 'Empower #32',       type: 'support', value: 0,  cost: 1,
    effect: 'Ally +4 dmg next card',
  },
  {
    baseId: 'regen_33',        name: 'Regen #33',         type: 'support', value: 4,  cost: 1,
    effect: 'Regen x2',        statusEffect: { type: 'regen', stacks: 2 },
  },
  {
    baseId: 'regen_34',        name: 'Regen #34',         type: 'support', value: 4,  cost: 1,
    effect: 'Regen x2',        statusEffect: { type: 'regen', stacks: 2 },
  },
  {
    baseId: 'strength_35',     name: 'Strength #35',      type: 'support', value: 0,  cost: 1,
    effect: 'Strength x2',     statusEffect: { type: 'strength', stacks: 2 },
  },
  {
    baseId: 'strength_36',     name: 'Strength #36',      type: 'support', value: 0,  cost: 1,
    effect: 'Strength x2',     statusEffect: { type: 'strength', stacks: 2 },
  },
  {
    baseId: 'inspire_37',      name: 'Inspire #37',       type: 'support', value: 0,  cost: 2,
    effect: 'Ally +8 dmg next card',
  },
  {
    baseId: 'mend_38',         name: 'Mend #38',          type: 'support', value: 6,  cost: 2,
    effect: 'Restore 6 HP',
  },
  {
    baseId: 'mend_39',         name: 'Mend #39',          type: 'support', value: 5,  cost: 1,
    effect: 'Restore 5 HP',
  },
  {
    baseId: 'rally_40',        name: 'Rally #40',         type: 'support', value: 0,  cost: 2,
    effect: 'Ally regen x3',   statusEffect: { type: 'regen', stacks: 3 },
  },

  // ─── SPECIAL ~6 ───────────────────────────────────────────────────────────
  {
    baseId: 'weaken_41',       name: 'Weaken #41',        type: 'special', value: 0,  cost: 1,
    effect: 'Weakness x2',     statusEffect: { type: 'weakness', stacks: 2 },
  },
  {
    baseId: 'weaken_42',       name: 'Weaken #42',        type: 'special', value: 0,  cost: 1,
    effect: 'Weakness x2',     statusEffect: { type: 'weakness', stacks: 2 },
  },
  {
    baseId: 'curse_43',        name: 'Curse #43',         type: 'special', value: 0,  cost: 2,
    effect: 'Poison x4',       statusEffect: { type: 'poison', stacks: 4 },
  },
  {
    baseId: 'hex_44',          name: 'Hex #44',           type: 'special', value: 3,  cost: 1,
    effect: 'Poison x1',       statusEffect: { type: 'poison', stacks: 1 },
  },
  {
    baseId: 'nullify_45',      name: 'Nullify #45',       type: 'special', value: 0,  cost: 2,
    effect: 'Boss: Weakness x3',
    statusEffect: { type: 'weakness', stacks: 3 },
  },
  {
    baseId: 'shatter_46',      name: 'Shatter #46',       type: 'special', value: 8,  cost: 2,
    effect: 'Weakness x2',     statusEffect: { type: 'weakness', stacks: 2 },
  },

  // ─── HIDDEN ~4 ────────────────────────────────────────────────────────────
  {
    baseId: 'shadow_47',       name: 'Shadow Strike #47', type: 'hidden',  value: 15, cost: 2,
    effect: 'Revealed on play',
  },
  {
    baseId: 'shadow_48',       name: 'Shadow Strike #48', type: 'hidden',  value: 15, cost: 2,
    effect: 'Revealed on play',
  },
  {
    baseId: 'veil_49',         name: 'Veil #49',          type: 'hidden',  value: 0,  cost: 1,
    effect: 'Conceal next card',
  },
  {
    baseId: 'veil_50',         name: 'Veil #50',          type: 'hidden',  value: 0,  cost: 1,
    effect: 'Conceal next card',
  },
]

// Каждая карта — в единственном экземпляре; 50 карт = 50 вхождений в колоду
export const CARDS_PER_TEMPLATE = 1
