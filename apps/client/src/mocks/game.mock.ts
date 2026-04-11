import type { GameState, Card, Player } from '@veil/shared'

// ─── Набор карт для мока (подмножество из 50-карточной колоды) ────────────────

export const ALL_CARDS: Card[] = [
  { id: 'slash_01',       baseId: 'slash_01',       name: 'Slash #1',       type: 'attack',  value: 8,  cost: 1 },
  { id: 'heavy_04',       baseId: 'heavy_04',       name: 'Heavy Blow #4',  type: 'attack',  value: 14, cost: 2 },
  { id: 'bleed_07',       baseId: 'bleed_07',       name: 'Bleed #7',       type: 'attack',  value: 5,  cost: 1, effect: 'Poison x2', statusEffect: { type: 'poison', stacks: 2 } },
  { id: 'parry_19',       baseId: 'parry_19',       name: 'Parry #19',      type: 'defense', value: 6,  cost: 1 },
  { id: 'shield_wall_22', baseId: 'shield_wall_22', name: 'Shield Wall #22',type: 'defense', value: 12, cost: 2 },
  { id: 'empower_31',     baseId: 'empower_31',     name: 'Empower #31',    type: 'support', value: 0,  cost: 1, effect: 'Ally +4 dmg next card' },
  { id: 'weaken_41',      baseId: 'weaken_41',      name: 'Weaken #41',     type: 'special', value: 0,  cost: 1, effect: 'Weakness x2', statusEffect: { type: 'weakness', stacks: 2 } },
  { id: 'surge_09',       baseId: 'surge_09',       name: 'Surge #9',       type: 'attack',  value: 6,  cost: 0, effect: 'Free strike' },
]

export function drawHand(count = 5): Card[] {
  const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((c, i) => ({ ...c, id: `${c.baseId}_${Date.now()}_${i}` }))
}

// ─── Boss action pool — использует `kind`, а не `type` ────────────────────────

export const BOSS_ACTION_POOL: GameState['boss']['nextAction'][] = [
  { kind: 'attack',        label: 'Soul Drain',    damage: 12, target: 'both' },
  { kind: 'attack',        label: 'Bone Crush',    damage: 18, target: 'player-1' },
  { kind: 'attack',        label: 'Dark Lash',     damage: 15, target: 'player-2' },
  { kind: 'status',        label: 'Curse of Rot',  status: { type: 'poison',   stacks: 3 }, target: 'both' },
  { kind: 'status',        label: 'Enfeeble',      status: { type: 'weakness', stacks: 2 }, target: 'player-1' },
  { kind: 'attack_status', label: 'Necrotic Bite', damage: 8, status: { type: 'poison', stacks: 2 }, target: 'player-2' },
]

export function randomBossAction(phase: number): GameState['boss']['nextAction'] {
  const pool = phase >= 2
    ? BOSS_ACTION_POOL
    : BOSS_ACTION_POOL.filter(a => a.kind === 'attack')
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Начальное состояние игры для мока ────────────────────────────────────────

function makeMockPlayer(id: 'player-1' | 'player-2', name: string): Player {
  return {
    id,
    name,
    hp: 50,
    maxHp: 50,
    shield: 0,
    energy: 1,
    maxEnergy: 10,
    hand: drawHand(3),
    handLimit: 7,
    deck: [],           // общая колода — скрыта от клиента
    discardPile: [],
    deckCount: 44,   // 50 − 6 стартовых
    statuses: [],
    selectedCardId: [],
    submitted: false,
    isAlive: true,
  }
}

export const initialGameState: GameState = {
  id: 'MOCK01',
  phase: 'action',
  turn: 1,
  boss: {
    id: 1,
    definitionId: 'hollow_lich',
    name: 'The Hollow Lich',
    hp: 800,
    maxHp: 800,
    phase: 1,
    statuses: [],
    nextAction: { kind: 'attack', label: 'Soul Drain', damage: 12, target: 'both' },
  },
  players: [
    makeMockPlayer('player-1', 'You'),
    makeMockPlayer('player-2', 'Ally'),
  ],
  sharedDeck: [],            // пусто — сервер скрывает содержимое
  sharedDiscardPile: [],
  log: [
    { turn: 0, text: 'The Hollow Lich awakens. Darkness falls.', type: 'system' },
  ],
}
