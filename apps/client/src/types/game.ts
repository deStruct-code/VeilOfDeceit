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
  Boss,
  GamePhase,
  RevealEntry,
  LogEntry,
  GameState,
} from '@veil/shared'