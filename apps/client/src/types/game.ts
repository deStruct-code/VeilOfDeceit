// Все типы теперь живут в @veil/shared
// Этот файл — обратная совместимость для импортов внутри клиента
export type {
  CardType,
  StatusType,
  StatusEffect,
  Card,
  PlayerSlot,
  Player,
  BossAction,
  GamePhase,
  RevealEntry,
  LogEntry,
  GameState,
} from '@veil/shared'