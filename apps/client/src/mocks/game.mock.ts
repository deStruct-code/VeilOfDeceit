import type {GameState} from "@veil/shared";

export const ALL_CARDS: Card[] = [
  { id: 'slash',       name: 'Slash',       type: 'attack',  value: 8,  cost: 1 },
  { id: 'heavy',       name: 'Heavy Blow',  type: 'attack',  value: 14, cost: 2 },
  { id: 'bleed',       name: 'Bleed',       type: 'attack',  value: 5,  cost: 1, effect: 'Poison ×2', statusEffect: { type: 'poison', stacks: 2 } },
  { id: 'parry',       name: 'Parry',       type: 'defense', value: 6,  cost: 1 },
  { id: 'shield_wall', name: 'Shield Wall', type: 'defense', value: 12, cost: 2 },
  { id: 'empower',     name: 'Empower',     type: 'support', value: 0,  cost: 1, effect: 'Ally +4 dmg next card' },
  { id: 'weaken',      name: 'Weaken',      type: 'special', value: 0,  cost: 1, effect: 'Boss: Weakness ×2', statusEffect: { type: 'weakness', stacks: 2 } },
  { id: 'surge',       name: 'Surge',       type: 'attack',  value: 6,  cost: 0, effect: 'Free card' },
]

export function drawHand(count = 5): Card[] {
  const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((c, i) => ({ ...c, id: `${c.id}_${Date.now()}_${i}` }))
}

export const BOSS_ACTION_POOL: GameState['boss']['nextAction'][] = [
  { type: 'attack',        label: 'Soul Drain',    damage: 12, target: 'both' },
  { type: 'attack',        label: 'Bone Crush',    damage: 18, target: 'player-1' },
  { type: 'attack',        label: 'Dark Lash',     damage: 15, target: 'player-2' },
  { type: 'status',        label: 'Curse of Rot',  status: { type: 'poison', stacks: 3 }, target: 'both' },
  { type: 'status',        label: 'Enfeeble',      status: { type: 'weakness', stacks: 2 }, target: 'player-1' },
  { type: 'attack_status', label: 'Necrotic Bite', damage: 8, status: { type: 'poison', stacks: 2 }, target: 'player-2' },
]

export function randomBossAction(phase: number): GameState['boss']['nextAction'] {
  const pool = phase >= 2
    ? BOSS_ACTION_POOL
    : BOSS_ACTION_POOL.filter(a => a.type === 'attack')
  return pool[Math.floor(Math.random() * pool.length)]
}

export const initialGameState: GameState = {
  id: 'game-001',
  phase: 'action',
  turn: 1,
  boss: {
    id: 'lich',
    name: 'The Hollow Lich',
    hp: 800,
    maxHp: 800,
    phase: 1,
    nextAction: { type: 'attack', label: 'Soul Drain', damage: 12, target: 'both' },
  },
  players: [
    {
      id: 'player-1', name: 'You',
      hp: 300, maxHp: 300,
      energy: 5, maxEnergy: 5,
      hand: drawHand(5),
      selectedCardId: null, submitted: false,
      statuses: [], shield: 0,
    },
    {
      id: 'player-2', name: 'Ally',
      hp: 200, maxHp: 200,
      energy: 5, maxEnergy: 5,
      hand: drawHand(3),
      selectedCardId: null, submitted: false,
      statuses: [], shield: 0,
    },
  ],
  log: [
    { turn: 0, text: 'The Hollow Lich awakens. Darkness falls.', type: 'system' },
  ],
}
