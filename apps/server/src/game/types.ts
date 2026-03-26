// Все типы теперь живут в @veil/shared
// Этот файл — обратная совместимость для импортов внутри сервера
export type {
  CardType,
  StatusType,
  StatusEffect,
  Card,
  PlayerSlot,
  Player,
  BossAction,
  Boss,
  GamePhase,
  RevealEntry,
  LogEntry,
  GameState,
} from '@veil/shared'

export {
  MAX_BUFFS,
  MAX_DEBUFFS,
  BUFF_TYPES,
  DEBUFF_TYPES,
  PLAYER_DEFAULTS,
} from '@veil/shared'