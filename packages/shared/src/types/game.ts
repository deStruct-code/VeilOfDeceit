import type { Card, StatusEffect } from './card'
import type { Player } from './player'

// ─── Boss ─────────────────────────────────────────────────────────────────────

export interface BossAction {
  type:    'attack' | 'status' | 'attack_status'
  label:   string
  damage?: number
  status?: { type: StatusEffect['type']; stacks: number }
  target:  'player-1' | 'player-2' | 'both'
}

export interface Boss {
  id:       string
  name:     string
  hp:       number
  maxHp:    number
  phase:    number
  statuses: StatusEffect[]
  nextAction: BossAction
}

// ─── Game phase ───────────────────────────────────────────────────────────────

export type GamePhase =
  | 'action'       // игроки выбирают карты
  | 'reveal'       // карты вскрыты, применяются эффекты
  | 'boss_attack'  // босс атакует
  | 'new_cards'    // раздача новых карт
  | 'defeat'       // оба игрока мертвы
  | 'victory'      // босс побеждён

// ─── Reveal ───────────────────────────────────────────────────────────────────

export interface RevealEntry {
  playerId:      string
  card:          Card
  damageDealt?:  number
  shieldGained?: number
  statusApplied?: StatusEffect
}

// ─── Log ──────────────────────────────────────────────────────────────────────

export interface LogEntry {
  turn: number
  text: string
  type?: 'damage' | 'status' | 'boss' | 'system'
}

// ─── GameState ────────────────────────────────────────────────────────────────

export interface GameState {
  id:      string
  phase:   GamePhase
  turn:    number
  boss:    Boss
  players: [Player, Player]
  log:     LogEntry[]
  lastReveal?: RevealEntry[]
  winner?: 'players' | 'boss'
}