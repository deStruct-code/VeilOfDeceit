import styles from './LobbyDecor.module.css'

export const RuneSymbol = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 40 40"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
    >
        <path
            d="M20 4 L20 36 M8 12 L32 12 M8 28 L32 28 M8 12 L20 4 L32 12 M8 28 L20 36 L32 28"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
        />
    </svg>
)

export const DiamondDivider = () => (
    <div className={styles.divider}>
        <div className={`${styles.dividerLine} ${styles.dividerLineLeft}`} />
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
            <path
                d="M8 1 L15 8 L8 15 L1 8 Z"
                stroke="rgba(180,130,60,0.7)"
                strokeWidth="1"
                fill="rgba(180,130,60,0.15)"
            />
        </svg>
        <div className={`${styles.dividerLine} ${styles.dividerLineRight}`} />
    </div>
)

export const CornerDecor = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const rotate = { tl: '0deg', tr: '90deg', br: '180deg', bl: '270deg' }[pos]
    return (
        <svg
            viewBox="0 0 32 32"
            width="32"
            height="32"
            fill="none"
            style={{
                transform: `rotate(${rotate})`,
                position: 'absolute',
                top:    pos === 'tl' || pos === 'tr' ? 0 : undefined,
                bottom: pos === 'bl' || pos === 'br' ? 0 : undefined,
                left:   pos === 'tl' || pos === 'bl' ? 0 : undefined,
                right:  pos === 'tr' || pos === 'br' ? 0 : undefined,
            }}
        >
            <path
                d="M2 2 L2 14 M2 2 L14 2"
                stroke="rgba(180,130,60,0.55)"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    )
}

export const RuneFooter = ({ className }: { className?: string }) => (
    <div className={`${styles.runes} ${className ?? ''}`}>
        {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ'].map((r, i) => (
            <span
                key={i}
                className={`${styles.rune} ${i === 2 ? styles.runeMid : styles.runeOuter}`}
            >
                {r}
            </span>
        ))}
    </div>
)

export const WaitingSpinner = () => (
    <svg
        className={styles.spinner}
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 100 100"
        overflow="visible"
        fill="#c09ee0"
        stroke="#a07bc8"
    >
        <defs>
            <polygon id="ldr" points="20,40 28,55 12,55" />
        </defs>
        {[0.17, 0.33, 0.5, 0.67, 0.83, 1.0, 1.17, 1.33, 1.5, 1.67, 1.83, 2.0].map((begin, i) => (
            <use key={i} xlinkHref="#ldr" transform={`rotate(${(i + 1) * 30} 50 50)`}>
                <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="2s"
                    begin={`${begin}s`}
                    repeatCount="indefinite"
                />
                <animateTransform
                    attributeName="transform"
                    type="scale"
                    additive="sum"
                    dur="2s"
                    begin={`${begin}s`}
                    repeatCount="indefinite"
                    from="0"
                    to="1.2"
                />
            </use>
        ))}
    </svg>
)
