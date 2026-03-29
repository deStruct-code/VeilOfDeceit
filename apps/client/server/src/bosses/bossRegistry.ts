import type { BossDefinition, BossAction, BossState, BossPhase } from '@veil/shared'
import { HOLLOW_LICH } from './hollowLich'

// ─── Реестр всех боссов ───────────────────────────────────────────────────────
// Чтобы добавить нового босса — достаточно создать файл и добавить сюда

const BOSS_REGISTRY: Record<string, BossDefinition> = {
  [HOLLOW_LICH.id]: HOLLOW_LICH,
}

export function getBossDefinition(id: string): BossDefinition {
  const def = BOSS_REGISTRY[id]
  if (!def) throw new Error(`Unknown boss: "${id}"`)
  return def
}

// ─── Создание начального состояния босса ─────────────────────────────────────

export function createBossState(definitionId: string): BossState {
  const def = getBossDefinition(definitionId)
  return {
    definitionId,
    name:       def.name,
    hp:         def.maxHp,
    maxHp:      def.maxHp,
    phase:      1,
    statuses:   [],
    nextAction: def.openingAction,
  }
}

// ─── Выбор следующего действия босса ─────────────────────────────────────────

export function pickNextBossAction(state: BossState): BossAction {
  const def = getBossDefinition(state.definitionId)

  // Текущая фаза — последняя из тех, чей порог уже достигнут
  const hpRatio = state.hp / state.maxHp
  const currentPhase = [...def.phases]
    .reverse()
    .find(p => hpRatio <= p.hpThreshold) ?? def.phases[0]

  const pool = currentPhase.actionPool
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Проверка перехода фазы ───────────────────────────────────────────────────
// Возвращает номер новой фазы если произошёл переход, иначе null

export function checkPhaseTransition(state: BossState): BossPhase | null {
  const def = getBossDefinition(state.definitionId)
  const hpRatio = state.hp / state.maxHp

  // Сортируем фазы по порогу убыванием — ищем первую достигнутую
  const reached = [...def.phases]
    .sort((a, b) => a.hpThreshold - b.hpThreshold)
    .filter(p => hpRatio <= p.hpThreshold && p.phase > state.phase)

  return reached[0] ?? null
}

export type { BossDefinition, BossAction, BossState }
export type { BossPhase } from '@veil/shared'