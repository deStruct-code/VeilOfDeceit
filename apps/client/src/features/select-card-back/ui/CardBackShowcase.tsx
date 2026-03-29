import { useState } from 'react'
import { CARD_BACKS, type CardBackId, saveSelectedCardBack } from '../../../entities/card/model/cardBack'
import { CARD_BACK_COMPONENTS } from '../../../entities/card/ui/card-backs/cardBackComponents'
import styles from './CardBackShowcase.module.css'

interface Props {
  initialSelected: CardBackId
  onBack: () => void
}

export function CardBackShowcase({ initialSelected, onBack }: Props) {
  const [selected, setSelected] = useState<CardBackId>(initialSelected)

  function handleSelect(id: CardBackId) {
    setSelected(id)
    saveSelectedCardBack(id)
  }

  function handleConfirm() {
    saveSelectedCardBack(selected)
    onBack()
  }

  return (
    <div className={styles.page}>
      <div className={styles.topGlow} />

      <div className={styles.inner}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
            <path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Главное меню
        </button>

        <div className={styles.header}>
          <div className={styles.headerLabel}>Дизайн колоды</div>
          <h1 className={styles.headerTitle}>РУБАШКИ КАРТ</h1>
          <p className={styles.headerSub}>4 варианта — выбери свой путь</p>
        </div>

        <div className={styles.grid}>
          {CARD_BACKS.map((card) => {
            const CardComp = CARD_BACK_COMPONENTS[card.id]
            const isSelected = selected === card.id
            return (
              <div
                key={card.id}
                className={styles.cardItem}
                style={{ transform: isSelected ? 'scale(1.04)' : 'scale(1)' }}
                onClick={() => handleSelect(card.id)}
              >
                <div
                  className={styles.cardWrapper}
                  style={{
                    border: isSelected ? `1.5px solid ${card.accent}` : '1.5px solid rgba(255,255,255,0.06)',
                    boxShadow: isSelected
                      ? `0 0 24px ${card.accent}40, 0 8px 32px rgba(0,0,0,0.7)`
                      : '0 4px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  <CardComp />
                </div>
                <div className={styles.cardLabel}>
                  <div
                    className={styles.cardName}
                    style={{ color: isSelected ? card.accent : 'rgba(180,160,120,0.55)' }}
                  >
                    {card.name}
                  </div>
                  <div
                    className={styles.cardSub}
                    style={{ color: isSelected ? card.accent2 : 'rgba(120,100,80,0.38)' }}
                  >
                    {card.subtitle}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button className={styles.confirmBtn} onClick={handleConfirm}>
          Сохранить выбор
        </button>

        <div className={styles.runes}>
          {['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ'].map((r, i) => (
            <span key={i} style={{ color: 'rgba(180,130,60,0.6)' }}>{r}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
