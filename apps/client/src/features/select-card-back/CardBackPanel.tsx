import { useState } from 'react'
import { CARD_BACKS, type CardBackId, saveSelectedCardBack } from '../../entities/card/model/cardBack'
import { CARD_BACK_COMPONENTS } from '../../entities/card/ui/card-backs/cardBackComponents'
import { CornerDecor, DiamondDivider, RuneFooter } from '../../shared/ui/lobby-decor'
import styles from './CardBackPanel.module.css'

interface Props {
    initialSelected: CardBackId
    onBack: () => void
}

/**
 * Выбор рубашки карт — вписан в стиль лобби-карточки.
 * Используется как грань FlipCard в LobbyCard.
 */
export function CardBackPanel({ initialSelected, onBack }: Props) {
    const [selected, setSelected] = useState<CardBackId>(initialSelected)

    function handleSelect(card: typeof CARD_BACKS[0]) {
        if (card.isLocked) return
        setSelected(card.id)
        saveSelectedCardBack(card.id)
    }

    function handleConfirm() {
        saveSelectedCardBack(selected)
        onBack()
    }

    return (
        <div className={styles.panel}>
            <CornerDecor pos="tl" />
            <CornerDecor pos="tr" />
            <CornerDecor pos="bl" />
            <CornerDecor pos="br" />

            <div className={styles.titleBlock}>
                <span className={styles.titleEyebrow}>Специальные рубашки</span>
                <h1 className={styles.title}>РУБАШКИ КАРТ</h1>
                <p className={styles.subtitle}>Доступ откроется по мере прохождения</p>
            </div>

            <DiamondDivider />

            <div className={styles.grid}>
                {CARD_BACKS.map((card) => {
                    const CardComp = CARD_BACK_COMPONENTS[card.id]
                    const isSelected = selected === card.id
                    const isLocked = card.isLocked
                    return (
                        <div
                            key={card.id}
                            className={`${styles.cardItem} ${isLocked ? styles.locked : ''}`}
                            onClick={() => handleSelect(card)}
                        >
                            <div
                                className={`${styles.cardWrapper} ${isSelected ? styles.cardWrapperSelected : ''}`}
                                style={isSelected ? {
                                    borderColor: card.accent,
                                    boxShadow: `0 0 24px ${card.accent}40, 0 8px 32px var(--veilofdeceit-bg-deep)`,
                                } : undefined}
                            >
                                <CardComp />
                                {isLocked && (
                                    <div className={styles.lockOverlay}>
                                        <div className={styles.lockIcon}>🔒</div>
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardLabel}>
                                <div
                                    className={`${styles.cardName} ${isSelected ? styles.cardNameSelected : ''}`}
                                    style={isSelected ? { color: card.accent } : undefined}
                                >
                                    {card.name}
                                </div>
                                <div
                                    className={`${styles.cardSub} ${isSelected ? styles.cardSubSelected : ''}`}
                                    style={isSelected ? { color: card.accent2 } : undefined}
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

        </div>
    )
}