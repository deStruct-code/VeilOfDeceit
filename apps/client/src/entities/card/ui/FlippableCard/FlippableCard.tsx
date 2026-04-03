import { useState, useEffect } from 'react'
import type { Card } from '@veil/shared'
import type { CardBackId } from '../../model/cardBack'
import { CARD_BACK_COMPONENTS } from '../card-backs/cardBackComponents'
import { FlipCard } from '../../../../shared/ui/FlipCard'
import styles from './FlippableCard.module.css'

const typeColors: Record<string, string> = {
    attack:  'var(--color-attack)',
    defense: 'var(--color-defense)',
    support: 'var(--color-support)',
    special: 'var(--color-special)',
    hidden:  'var(--color-hidden)',
}

interface Props {
    card: Card
    /** Когда true — карта переворачивается лицом вверх */
    revealed: boolean
    /** Задержка перед началом флипа (мс), для каскадных анимаций */
    delay?: number
    cardBackId?: CardBackId
}

/**
 * Игровая карта с flip-анимацией.
 * Используется в RevealOverlay при раскрытии карт.
 */
export function FlippableCard({ card, revealed, delay = 0, cardBackId = 'veil-mandala' }: Props) {
    const [isFlipped, setIsFlipped] = useState(false)

    useEffect(() => {
        if (!revealed) {
            setIsFlipped(false)
            return
        }
        const timer = setTimeout(() => setIsFlipped(true), delay)
        return () => clearTimeout(timer)
    }, [revealed, delay])

    const CardBackSvg = CARD_BACK_COMPONENTS[cardBackId] ?? CARD_BACK_COMPONENTS['veil-mandala']

    const cardFront = (
        <div
            className={styles.front}
            style={{ '--accent': typeColors[card.type] } as React.CSSProperties}
        >
            <div className={styles.cardTop}>
                <span className={styles.cardType}>{card.type}</span>
                {card.cost > 0 && <span className={styles.cardCost}>{card.cost}⚡</span>}
            </div>
            <div className={styles.cardName}>{card.name}</div>
            <div className={styles.cardBottom}>
                {card.value > 0 && <span className={styles.cardValue}>{card.value}</span>}
                {card.effect && <span className={styles.cardEffect}>{card.effect}</span>}
            </div>
        </div>
    )

    const cardBack = (
        <div className={styles.back}>
            <div className={styles.cardBackInner}>
                <CardBackSvg />
            </div>
        </div>
    )

    return (
        <div className={styles.wrapper}>
            <FlipCard
                flipped={isFlipped}
                front={cardFront}
                back={cardBack}
            />
        </div>
    )
}
