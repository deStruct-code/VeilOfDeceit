import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { normalizeRoomCode } from '../../shared/lib/roomCode'
import { getOrCreatePlayerId } from '../../shared/lib/playerId'
import { createLobbySocket, type LobbyServerMessage } from '../../shared/lib/ws'
import { getOrGeneratePlayerName } from '../../shared/lib/playerName'
import { setRoomPlayerSlot } from '../../shared/lib/playerSlot'
import styles from './RoomPage.module.css'

type ConnectionState = 'connecting' | 'waiting' | 'ready' | 'error'

export function RoomPage() {
  const navigate = useNavigate()
  const params = useParams()

  const roomCode = useMemo(() => normalizeRoomCode(params.code ?? '').slice(0, 6), [params.code])
  const playerIdRef = useRef<string>(getOrCreatePlayerId())

  const [state, setState] = useState<ConnectionState>('connecting')
  const [playerCount, setPlayerCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (roomCode.length !== 6) {
      setState('error')
      setError('Некорректный код комнаты.')
      return
    }

    const ws = createLobbySocket()
    setState('connecting')
    setError(null)

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ type: 'join', roomCode, playerId: playerIdRef.current, playerName: getOrGeneratePlayerName() }))
    })

    ws.addEventListener('message', (evt) => {
      let msg: LobbyServerMessage
      try {
        msg = JSON.parse(String(evt.data))
      } catch {
        return
      }

      if (msg.type === 'error') {
        setState('error')
        setError(msg.message)
        return
      }

      if (msg.type === 'joined') {
        setPlayerCount(msg.playerCount)
        setRoomPlayerSlot(roomCode, msg.slot)
        setState(msg.playerCount >= 2 ? 'ready' : 'waiting')
        return
      }

      if (msg.type === 'ready') {
        setPlayerCount(msg.playerCount)
        setState('ready')
        navigate(`/game/${roomCode}`)
      }
    })

    ws.addEventListener('close', () => {
      // If we already moved to game, ignore disconnect here.
      setState((prev) => (prev === 'ready' ? prev : 'error'))
      setError((prev) => prev ?? 'Соединение закрыто.')
    })

    ws.addEventListener('error', () => {
      setState('error')
      setError('Ошибка WebSocket соединения.')
    })

    return () => {
      ws.close()
    }
  }, [roomCode])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topRow}>
          <div className={styles.code}>{roomCode || '??????'}</div>
          <div className={styles.pill}>
            {state === 'connecting' && 'подключение...'}
            {state === 'waiting' && `ожидание игрока ( ${playerCount}/2 )`}
            {state === 'ready' && `готово ( ${playerCount}/2 )`}
            {state === 'error' && 'ошибка'}
          </div>
        </div>

        <p className={styles.status}>
          {state === 'connecting' && 'Создаём связь с сервером.'}
          {state === 'waiting' && 'Ждём второго игрока. Отправь ему этот код.'}
          {state === 'ready' && 'Сессия стартует...'}
          {state === 'error' && (error ?? 'Неизвестная ошибка.')}
        </p>

        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => navigate('/')}>Назад в лобби</button>
          {state === 'ready' && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate(`/game/${roomCode}`)}>
              Перейти в игру
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

