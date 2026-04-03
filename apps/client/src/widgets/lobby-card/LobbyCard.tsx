import { type ReactNode } from 'react'
import { FlipCard } from '../../shared/ui/FlipCard'
import { RoomWaitingPanel } from '../../features/room-waiting'
import { useRoomWaiting } from '../../features/room-waiting'

import { getSelectedCardBack } from '../../entities/card/model/cardBack'
import styles from './LobbyCard.module.css'
import { CardBackPanel } from '../../features/select-card-back/CardBackPanel'

export type LobbyView = 'menu' | 'room' | 'cards'

interface Props {
    view: LobbyView
    roomCode: string
    onBack: () => void
    front: ReactNode
}

/**
 * Виджет-карточка лобби с тремя гранями:
 *   front  — главное меню
 *   back   — комната ожидания (rotateY 180deg)
 *   left   — выбор рубашек   (rotateY -180deg)
 */
export function LobbyCard({ view, roomCode, onBack, front }: Props) {
    const { roomState, playerCount, roomError, copied, handleShare, handleEnterGame } =
        useRoomWaiting({ roomCode, active: view === 'room' })

    const flipSide = view === 'room' ? 'back' : view === 'cards' ? 'left' : 'front'

    return (
        <FlipCard
            side={flipSide}
            className={styles.scene}
            front={
                <div className={styles.menuFace}>
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
            left={
                <CardBackPanel
                    initialSelected={getSelectedCardBack()}
                    onBack={onBack}
                />
            }
        />
    )
}