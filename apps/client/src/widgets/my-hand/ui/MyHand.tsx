import type { Card } from '@veil/shared'
import styles from './MyHand.module.css'

interface Props {
  cards: Card[]
  selectedCardIds: string[]
  onSelect: (cardId: string) => void
  usedEnergy: number
  maxEnergy: number
  disabled?: boolean
}

const OVERLAP_PX = 120

const typeColors: Record<string, string> = {
  attack:  'var(--color-attack)',
  defense: 'var(--color-defense)',
  support: 'var(--color-support)',
  special: 'var(--color-special)',
  hidden:  'var(--color-hidden)',
}

function CardItem({
  card,
  selected,
  disabled,
  onSelect,
}: {
  card: Card
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
      onClick={() => { if (!disabled) onSelect() }}
      disabled={disabled}
      style={{ '--accent': typeColors[card.type] } as React.CSSProperties}
      title={card.name}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardType}>{card.type}</span>
        {card.cost > 0 && (
          <span className={styles.cardCost}>{card.cost}⚡</span>
        )}
      </div>
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardBottom}>
        {card.value > 0 && (
          <span className={styles.cardValue}>{card.value}</span>
        )}
        {card.effect && (
          <span className={styles.cardEffect}>{card.effect}</span>
        )}
      </div>
    </button>
  )
}

export function MyHand({ cards, selectedCardIds, onSelect, usedEnergy, maxEnergy, disabled = false }: Props) {
  if (cards.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>— no cards —</span>
      </div>
    )
  }

  // Ширина контейнера: первая карта полностью + остальные с перекрытием
  const CARD_W = 116
  const totalWidth = CARD_W + (cards.length - 1) * OVERLAP_PX

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.fan}
        style={{ width: totalWidth, height: 160 }}
      >
        {cards.map((card, i) => {
          const isSelected = selectedCardIds.includes(card.id)
          const isAffordable = isSelected || (usedEnergy + card.cost <= maxEnergy)
          const isDisabled = disabled || card.type === 'hidden' || !isAffordable

          return (
            <div
              key={card.id}
              className={styles.slot}
              style={{
                left: i * OVERLAP_PX,
                zIndex: isSelected ? 200 + i : i,
              }}
            >
              <CardItem
                card={card}
                selected={isSelected}
                disabled={isDisabled}
                onSelect={() => onSelect(card.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
