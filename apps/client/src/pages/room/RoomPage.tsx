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

  const pillClass = state === 'ready'
    ? `${styles.pill} ${styles.pillReady}`
    : state === 'error'
      ? `${styles.pill} ${styles.pillError}`
      : styles.pill

  const pillText = {
    connecting: 'подключение...',
    waiting:    `ожидание ( ${playerCount} / 2 )`,
    ready:      `готово ( ${playerCount} / 2 )`,
    error:      'ошибка',
  }[state]

  const statusText = {
    connecting: 'Создаём связь с сервером.',
    waiting:    'Ждём второго игрока. Отправь ему этот код.',
    ready:      'Сессия стартует...',
    error:      error ?? 'Неизвестная ошибка.',
  }[state]

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Код + пилюля */}
        <div className={styles.topRow}>
          <div className={styles.code}>{roomCode || '??????'}</div>
          <div className={pillClass}>{pillText}</div>
        </div>

        <div className={styles.divider} />

        {/* Слоты игроков */}
        <div className={styles.slots}>
          <div className={`${styles.slot} ${playerCount >= 1 ? styles.slotFilled : styles.slotEmpty}`}>
            {playerCount >= 1 ? 'Игрок I' : 'ожидание...'}
          </div>
          <div className={`${styles.slot} ${playerCount >= 2 ? styles.slotFilled : styles.slotEmpty}`}>
            {playerCount >= 2 ? 'Игрок II' : 'ожидание...'}
          </div>
        </div>

        {/* Статус */}
        <p className={`${styles.status} ${state === 'error' ? styles.statusError : ''}`}>
          {state === 'waiting'
            ? <span className={styles.waitingDots}>{statusText}</span>
            : statusText
          }
        </p>

        {/* Кнопки */}
        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => navigate('/')}>
            ← Назад
          </button>
          {state === 'ready' && (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => navigate(`/game/${roomCode}`)}
            >
              Войти в игру
            </button>
          )}
        </div>

      </div>
    </div>
  )
}