import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLobbySocket, type LobbyServerMessage } from '../../../shared/lib/ws'
import { getOrGeneratePlayerName } from '../../../shared/lib/playerName'
import { setRoomPlayerSlot, setAllyCardBack } from '../../../shared/lib/playerSlot'
import { getOrCreatePlayerId } from '../../../shared/lib/playerId'
import { getSelectedCardBack } from '../../../entities/card/cardBack'

export type RoomState = 'connecting' | 'waiting' | 'ready' | 'error'

interface UseRoomWaitingOptions {
    roomCode: string
    active: boolean
}

export function useRoomWaiting({ roomCode, active }: UseRoomWaitingOptions) {
    const navigate = useNavigate()
    const [roomState, setRoomState] = useState<RoomState>('connecting')
    const [playerCount, setPlayerCount] = useState(0)
    const [roomError, setRoomError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)
    const playerIdRef = useRef<string>(getOrCreatePlayerId())

    useEffect(() => {
        if (!active || !roomCode) return

        const ws = createLobbySocket()
        wsRef.current = ws
        setRoomState('connecting')
        setRoomError(null)

        ws.addEventListener('open', () => {
            ws.send(JSON.stringify({
                type: 'join',
                roomCode,
                playerId: playerIdRef.current,
                playerName: getOrGeneratePlayerName(),
                cardBackId: getSelectedCardBack(),
            }))
        })

        ws.addEventListener('message', (evt) => {
            let msg: LobbyServerMessage
            try {
                msg = JSON.parse(String(evt.data))
            } catch {
                return
            }

            if (msg.type === 'error') {
                setRoomState('error')
                setRoomError(msg.message)
                return
            }
            if (msg.type === 'joined') {
                setPlayerCount(msg.playerCount)
                setRoomPlayerSlot(roomCode, msg.slot)
                if (msg.allyCardBackId) setAllyCardBack(roomCode, msg.allyCardBackId)
                setRoomState(msg.playerCount >= 2 ? 'ready' : 'waiting')
                return
            }
            if (msg.type === 'ready') {
                setPlayerCount(msg.playerCount)
                if (msg.allyCardBackId) setAllyCardBack(roomCode, msg.allyCardBackId)
                setRoomState('ready')
                navigate(`/game/${roomCode}`)
            }
        })

        ws.addEventListener('close', () => {
            setRoomState((prev) => (prev === 'ready' ? prev : 'error'))
            setRoomError((prev) => prev ?? 'Соединение закрыто.')
        })

        ws.addEventListener('error', () => {
            setRoomState('error')
            setRoomError('Ошибка соединения.')
        })

        return () => {
            ws.close()
            wsRef.current = null
        }
    }, [active, roomCode])

    function handleShare() {
        navigator.clipboard
            .writeText(`${window.location.origin}/room/${roomCode}`)
            .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
    }

    function handleEnterGame() {
        navigate(`/game/${roomCode}`)
    }

    return { roomState, playerCount, roomError, copied, handleShare, handleEnterGame }
}
