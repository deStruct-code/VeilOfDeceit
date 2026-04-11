import { CardBackVeilMandala } from '../../../entities/card/ui/card-backs'
import styles from './DeckStack.module.css'

export interface DeckStackProps {
  /** Реальное количество карт в колоде */
  count: number
  /** Лейбл под стопкой (напр. "Колода") */
  label?: string
}

const LAYERS = 4

export function DeckStack({ count, label = 'Deck' }: DeckStackProps) {
  const visibleLayers = count === 0 ? 1 : Math.min(LAYERS, count)

  return (
    <div className={styles.wrapper} title={`${count} cards remaining`}>
      <div className={`${styles.stack} ${count === 0 ? styles.empty : ''}`}>
        {Array.from({ length: visibleLayers }).map((_, i) => (
          <div
            key={i}
            className={styles.layer}
            style={{
              top: i * 2,
              left: i * 2,
              zIndex: LAYERS - i,
              opacity: count === 0 ? 0.22 : 1 - i * 0.08,
            }}
          >
            <CardBackVeilMandala />
          </div>
        ))}

        {/* Счётчик поверх стопки */}
        <span className={`${styles.counter} ${count === 0 ? styles.counterEmpty : ''}`}>
          {count}
        </span>
      </div>

      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
