// ─── Card ────────────────────────────────────────────────────────────────────

export type CardType = 'attack' | 'defense' | 'support' | 'special' | 'hidden' 

export type StatusType = 'poison' | 'weakness' | 'strength' | 'regen' | 'shield' | 'bleed'

export interface StatusEffect {
  type:   StatusType
  stacks: number
}

export interface Card {
  id:           string       // уникальный id экземпляра (baseId + timestamp + index)
  baseId:       string       // id шаблона карты (напр. 'slash'), для дедупликации
  name:         string
  type:         CardType
  value:        number       // урон / броня / хил в зависимости от типа
  cost:         number       // стоимость в энергии
  effect?:      string       // текстовое описание эффекта для UI
  statusEffect?: {
    type:   StatusType
    stacks: number
  }
}