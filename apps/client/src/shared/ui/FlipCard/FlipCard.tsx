import { type ReactNode, useState, useEffect, useRef } from 'react'
import styles from './FlipCard.module.css'

type FlipSide = 'front' | 'back' | 'left'

interface Props {
    side: FlipSide
    front: ReactNode
    back?: ReactNode
    left?: ReactNode
    className?: string
}

const HALF_DURATION = 200 // ms — половина transition (0.2s)

export function FlipCard({ side, front, back, left, className }: Props) {
    const [visibleSide, setVisibleSide] = useState<FlipSide>(side)
    const [hidden, setHidden] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (side === visibleSide) return

        // Шаг 1: скрыть (scaleX → 0)
        setHidden(true)

        // Шаг 2: в середине анимации — сменить контент
        timerRef.current = setTimeout(() => {
            setVisibleSide(side)
            // Шаг 3: показать (scaleX → 1)
            setHidden(false)
        }, HALF_DURATION)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [side])

    const content: ReactNode =
        visibleSide === 'back' ? back :
        visibleSide === 'left' ? left :
        front

    return (
        <div className={`${styles.scene} ${className ?? ''}`}>
            <div className={`${styles.inner} ${hidden ? styles.innerHidden : ''}`}>
                {content}
            </div>
        </div>
    )
}
