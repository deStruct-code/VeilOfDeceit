import type { Card, StatusEffect } from './card'

// ─── Player slot ─────────────────────────────────────────────────────────────

export type PlayerSlot = 'player-1' | 'player-2'

// ─── Status constraints ───────────────────────────────────────────────────────

export const MAX_BUFFS   = 3
export const MAX_DEBUFFS = 3

// Какие статусы считаются баффами, какие дебаффами
export const BUFF_TYPES:   readonly StatusEffect['type'][] = ['strength', 'regen', 'shield']
export const DEBUFF_TYPES: readonly StatusEffect['type'][] = ['poison', 'weakness',]

// ─── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  // Идентификация
  id:    PlayerSlot
  name:  string

  // Здоровье
  hp:    number   // текущее HP
  maxHp: number   // максимум (50 по умолчанию)

  // Временная броня — сбрасывается в начале каждого хода
  shield: number

  // Энергия — растёт каждый ход: ход N = min(N, maxEnergy)
  energy:    number
  maxEnergy: number   // cap = 10, иначе поздние ходы сломают баланс

  // Карты
  hand:        Card[]   // текущая рука (не более handLimit)
  handLimit:   number   // максимум карт в руке (7)
  deck:        Card[]   // личная колода (тянутся карты)
  discardPile: Card[]   // сброс; когда deck пуст — перемешивается обратно

  // Статусы: бафы (до MAX_BUFFS) + дебафы (до MAX_DEBUFFS)
  statuses: StatusEffect[]

  // Состояние хода
  selectedCardId: string | null   // выбранная карта до сабмита
  submitted:      boolean         // подтвердил ли ход

  // Живой?
  isAlive: boolean
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const PLAYER_DEFAULTS = {
  maxHp:      50,
  handLimit:  7,
  startCards: 5,   // сколько карт тянуть в начале игры
  maxEnergy:  10,
} as const