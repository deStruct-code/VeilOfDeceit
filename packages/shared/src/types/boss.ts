import type { StatusEffect } from './card'

// ─── Типы действий босса ──────────────────────────────────────────────────────

// Базовые типы — урон и статусы
export type BossActionType =
  | 'attack'          // урон игрокам
  | 'status'          // наложить статус на игроков
  | 'attack_status'   // урон + статус

// Специальные механики — уникальны для каждого босса
// Новые механики добавляются сюда по мере появления боссов
export type BossSpecialType =
  | 'burn_cards'      // сжигает N карт из колоды игрока
  | 'swap_hands'      // меняет руки игроков местами
  | 'steal_energy'    // крадёт энергию
  | 'resurrect'       // восстанавливает HP босса

export type BossActionKind = BossActionType | BossSpecialType

// ─── Действие босса ───────────────────────────────────────────────────────────

export interface BossAction {
  kind:    BossActionKind
  label:   string                          // текст для UI: "Soul Drain"
  target:  'player-1' | 'player-2' | 'both' | 'random'

  // Поля для базовых действий
  damage?: number
  status?: { type: StatusEffect['type']; stacks: number }

  // Поля для специальных механик
  count?:  number    // сколько карт сжечь / сколько энергии украсть
}

// ─── Фаза босса ───────────────────────────────────────────────────────────────

export interface BossPhase {
  phase:         number   // номер фазы (1, 2, 3...)
  hpThreshold:   number   // переход при hp <= этого значения (0..1, доля от maxHp)
  label:         string   // "Awakened", "Enraged"
  actionPool:    BossAction[]
  // Пассивные эффекты фазы (опционально)
  passiveEffect?: string  // текстовое описание для UI
}

// ─── Шаблон босса (определение) ───────────────────────────────────────────────
// Хранится в коде, не в GameState

export interface BossDefinition {
  id:          string
  name:        string
  lore:        string    // короткое описание для UI

  maxHp:       number
  phases:      BossPhase[]   // минимум одна фаза

  // Первое действие при старте игры (до рандома)
  openingAction: BossAction

  // Сообщение при появлении босса в логе
  spawnMessage: string
}

// ─── Состояние босса в GameState ─────────────────────────────────────────────
// Это то что сериализуется в БД и летит на клиент

export interface BossState {
  definitionId: string      // ссылка на BossDefinition.id
  name:         string
  hp:           number
  maxHp:        number
  phase:        number      // текущий номер фазы
  statuses:     StatusEffect[]
  nextAction:   BossAction
}