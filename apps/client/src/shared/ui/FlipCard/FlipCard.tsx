import type { ReactNode } from 'react'
import styles from './FlipCard.module.css'

interface Props {
    flipped: boolean
    front: ReactNode
    back: ReactNode
    className?: string
}

/**
 * Базовый переиспользуемый flip-компонент.
 * front — лицевая сторона, back — обратная (показывается при flipped=true).
 */
export function FlipCard({ flipped, front, back, className }: Props) {
    return (
        <div className={`${styles.scene} ${className ?? ''}`}>
            <div className={`${styles.inner} ${flipped ? styles.innerFlipped : ''}`}>
                <div className={styles.face}>
                    {front}
                </div>
                <div className={`${styles.face} ${styles.back}`}>
                    {back}
                </div>
            </div>
        </div>
    )
}
