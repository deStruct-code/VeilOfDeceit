import { CardBackVeilMandala } from '../../../entities/card/ui/card-backs'
import styles from './DeckStack.module.css'
import discardStyles from './DiscardStack.module.css'

export interface DiscardStackProps {
  count: number
  label?: string
}

const LAYERS = 4

export function DiscardStack({ count, label = 'Discard' }: DiscardStackProps) {
  const visibleLayers = count === 0 ? 1 : Math.min(LAYERS, count)

  return (
    <div className={styles.wrapper} title={`${count} cards discarded`}>
      <div className={`${discardStyles.stack} ${count === 0 ? styles.empty : ''}`}>
        {Array.from({ length: visibleLayers }).map((_, i) => (
          <div
            key={i}
            className={styles.layer}
            style={{
              top:   i * 2,
              right: i * 2,
              zIndex: LAYERS - i,
              opacity: count === 0 ? 0.22 : 1 - i * 0.08,
            }}
          >
            <CardBackVeilMandala />
          </div>
        ))}

        <span className={`${styles.counter} ${discardStyles.counter} ${count === 0 ? styles.counterEmpty : ''}`}>
          {count}
        </span>
      </div>

      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
