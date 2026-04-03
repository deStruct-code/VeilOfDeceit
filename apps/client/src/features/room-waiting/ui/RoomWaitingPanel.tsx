import { getPlayerName } from '../../../shared/lib/playerName'
import { DiamondDivider, WaitingSpinner, CornerDecor, RuneFooter } from '../../../shared/ui/lobby-decor'
import type { RoomState } from '../model/useRoomWaiting'
import styles from './RoomWaitingPanel.module.css'

interface Props {
    roomCode: string
    roomState: RoomState
    playerCount: number
    roomError: string | null
    copied: boolean
    onShare: () => void
    onBack: () => void
    onEnterGame: () => void
}

export function RoomWaitingPanel({
    roomCode,
    roomState,
    playerCount,
    roomError,
    copied,
    onShare,
    onBack,
    onEnterGame,
}: Props) {
    const pillClass =
        roomState === 'ready'
            ? `${styles.pill} ${styles.pillReady}`
            : roomState === 'error'
              ? `${styles.pill} ${styles.pillError}`
              : styles.pill

    const pillText = {
        connecting: 'подключение...',
        waiting:    `ожидание ( ${playerCount} / 2 )`,
        ready:      `готово ( ${playerCount} / 2 )`,
        error:      'ошибка',
    }[roomState]

    const statusText = {
        connecting: 'Создаём связь с сервером.',
        waiting:    'Ждём второго игрока. Отправь ему этот код.',
        ready:      'Сессия стартует...',
        error:      roomError ?? 'Неизвестная ошибка.',
    }[roomState]

    return (
        <div className={styles.panel}>
            <CornerDecor pos="tl" />
            <CornerDecor pos="tr" />
            <CornerDecor pos="bl" />
            <CornerDecor pos="br" />

            <div className={styles.titleBlock}>
                <span className={styles.titleEyebrow}>Комната ожидания</span>
                <h1 className={styles.titleCode}>{roomCode || '······'}</h1>
            </div>

            <div className={styles.pillRow}>
                <div className={pillClass}>{pillText}</div>
            </div>

            <DiamondDivider />

            <div className={styles.slots}>
                <div className={`${styles.slot} ${playerCount >= 1 ? styles.slotFilled : styles.slotEmpty}`}>
                    {playerCount >= 1 ? getPlayerName() || 'Игрок I' : 'ожидание...'}
                </div>
                <div className={`${styles.slot} ${playerCount >= 2 ? styles.slotFilled : styles.slotEmpty}`}>
                    {playerCount >= 2 ? 'Игрок II' : 'ожидание...'}
                </div>
            </div>

            <p className={`${styles.status} ${roomState === 'error' ? styles.statusError : ''}`}>
                {roomState === 'waiting' && <WaitingSpinner />}
                {statusText}
            </p>

            <DiamondDivider />

            <div className={styles.buttons}>
                {roomState === 'waiting' && (
                    <button
                        className={`${styles.btnSolo} ${copied ? styles.btnCopied : ''}`}
                        onClick={onShare}
                    >
                        {copied ? '✓ Скопировано' : 'Поделиться'}
                    </button>
                )}
                <button className={styles.btnDuo} onClick={onBack}>
                    ← Назад
                </button>
                {roomState === 'ready' && (
                    <button className={styles.btnSolo} onClick={onEnterGame}>
                        Войти в игру
                    </button>
                )}
            </div>

            <RuneFooter />
        </div>
    )
}
