export type CardType = 'attack' | 'defense' | 'support' | 'special' | 'hidden'
export type StatusType = 'poison' | 'weakness' | 'shield'

export interface Card {
  id: string
  name: string
  type: CardType
  value: number
  cost: number
  effect?: string
  statusEffect?: { type: StatusType; stacks: number }
}

export interface StatusEffect {
  type: StatusType
  stacks: number
}

export interface BossAction {
  type: 'attack' | 'status' | 'attack_status'
  label: string
  damage?: number
  status?: { type: StatusType; stacks: number }
  target: 'player-1' | 'player-2' | 'both'
}

export interface Boss {
  id: string
  name: string
  hp: number
  maxHp: number
  phase: number
  statuses?: StatusEffect[]
  nextAction: BossAction
}

export interface Player {
  id: string
  name: string
  hp: number
  maxHp: number
  energy: number
  maxEnergy: number
  hand: Card[]
  selectedCardId: string | null
  submitted: boolean
  statuses: StatusEffect[]
  shield: number
}

export type GamePhase = 'action' | 'reveal' | 'boss_attack' | 'new_cards' | 'defeat' | 'victory'

export interface RevealEntry {
  playerId: string
  card: Card
  damageDealt?: number
  shieldGained?: number
  statusApplied?: StatusEffect
}

export interface LogEntry {
  turn: number
  text: string
  type?: 'damage' | 'status' | 'boss' | 'system'
}

export interface GameState {
  id: string
  phase: GamePhase
  turn: number
  boss: Boss
  players: [Player, Player]
  log: LogEntry[]
  lastReveal?: RevealEntry[]
  winner?: 'players' | 'boss'
}
