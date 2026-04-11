import { useState, useEffect } from 'react'
import type { Card } from '@veil/shared'
import type { CardBackId } from '../../cardBack'
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
    revealed: boolean
    delay?: number
    cardBackId?: CardBackId
}

export function FlippableCard({ card, revealed, delay = 0, cardBackId = 'veil-mandala' }: Props) {
    const [side, setSide] = useState<'front' | 'back'>('front')

    useEffect(() => {
        if (!revealed) { setSide('front'); return }
        const t = setTimeout(() => setSide('back'), delay)
        return () => clearTimeout(t)
    }, [revealed, delay])

    const CardBackSvg = CARD_BACK_COMPONENTS[cardBackId] ?? CARD_BACK_COMPONENTS['veil-mandala']

    return (
        <div className={styles.wrapper}>
            <FlipCard
                side={side}
                front={
                    <div className={styles.back}>
                        <div className={styles.cardBackInner}><CardBackSvg /></div>
                    </div>
                }
                back={
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
                }
            />
        </div>
    )
}
