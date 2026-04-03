import { type ReactNode } from 'react'
import { FlipCard } from '../../shared/ui/FlipCard'
import { RoomWaitingPanel } from '../../features/room-waiting'
import { useRoomWaiting } from '../../features/room-waiting'
import styles from './LobbyCard.module.css'

interface Props {
    roomCode: string
    flipped: boolean
    onBack: () => void
    front: ReactNode
}

/**
 * Виджет-карточка лобби с flip-анимацией.
 * front — лицевая сторона (меню), back — комната ожидания.
 * Управляет WS-соединением через useRoomWaiting.
 */
export function LobbyCard({ roomCode, flipped, onBack, front }: Props) {
    const { roomState, playerCount, roomError, copied, handleShare, handleEnterGame } =
        useRoomWaiting({ roomCode, active: flipped })

    return (
        <FlipCard
            flipped={flipped}
            className={styles.scene}
            front={
                <div className={styles.face}>
                    {front}
                </div>
            }
            back={
                <RoomWaitingPanel
                    roomCode={roomCode}
                    roomState={roomState}
                    playerCount={playerCount}
                    roomError={roomError}
                    copied={copied}
                    onShare={handleShare}
                    onBack={onBack}
                    onEnterGame={handleEnterGame}
                />
            }
        />
    )
}
