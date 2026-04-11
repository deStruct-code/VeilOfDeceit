import type { CardBackId } from '../../../entities/card/cardBack'
import { CARD_BACK_COMPONENTS } from '../../../entities/card/ui/card-backs/cardBackComponents'
import styles from './AllyHandStack.module.css'

interface Props {
  cardCount: number   // ally.hand.length
  cardBackId: CardBackId
}

const MAX_VISIBLE = 7  // максимум рубашек в ряду

export function AllyHandStack({ cardCount, cardBackId }: Props) {
  const CardBackSvg = CARD_BACK_COMPONENTS[cardBackId] ?? CARD_BACK_COMPONENTS['veil-mandala']
  const visibleCount = Math.min(MAX_VISIBLE, cardCount)
  const isEmpty = cardCount === 0

  if (isEmpty) {
    return (
      <div className={styles.emptyRow}>
        <span className={styles.emptyText}>— no cards —</span>
      </div>
    )
  }

  return (
    <div className={styles.row} title={`Ally: ${cardCount} cards`}>
      {Array.from({ length: visibleCount }).map((_, i) => (
        <div key={i} className={styles.card}>
          <CardBackSvg />
        </div>
      ))}
      {cardCount > MAX_VISIBLE && (
        <span className={styles.overflow}>+{cardCount - MAX_VISIBLE}</span>
      )}
    </div>
  )
}
