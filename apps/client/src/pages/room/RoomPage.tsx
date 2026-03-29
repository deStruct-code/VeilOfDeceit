import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { normalizeRoomCode } from '../../shared/lib/roomCode'
import { getOrCreatePlayerId } from '../../shared/lib/playerId'
import { createLobbySocket, type LobbyServerMessage } from '../../shared/lib/ws'
import { getOrGeneratePlayerName } from '../../shared/lib/playerName'
import { setRoomPlayerSlot } from '../../shared/lib/playerSlot'
import styles from './RoomPage.module.css'

type ConnectionState = 'connecting' | 'waiting' | 'ready' | 'error'

// ── Decorative SVG components (same as LobbyPage) ─────────────────

const DiamondDivider = () => (
  <div className={styles.divider}>
    <div className={`${styles.dividerLine} ${styles.dividerLineLeft}`}/>
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
      <path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="rgba(180,130,60,0.7)" strokeWidth="1" fill="rgba(180,130,60,0.15)"/>
    </svg>
    <div className={`${styles.dividerLine} ${styles.dividerLineRight}`}/>
  </div>
)

const CornerDecor = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const rotate = { tl: '0deg', tr: '90deg', br: '180deg', bl: '270deg' }[pos]
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" style={{
      transform: `rotate(${rotate})`,
      position: 'absolute',
      top:    pos === 'tl' || pos === 'tr' ? 0 : undefined,
      bottom: pos === 'bl' || pos === 'br' ? 0 : undefined,
      left:   pos === 'tl' || pos === 'bl' ? 0 : undefined,
      right:  pos === 'tr' || pos === 'br' ? 0 : undefined,
    }}>
      <path d="M2 2 L2 14 M2 2 L14 2" stroke="rgba(180,130,60,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────

export function RoomPage() {
  const navigate = useNavigate()
  const params = useParams()

  const roomCode = useMemo(() => normalizeRoomCode(params.code ?? '').slice(0, 6), [params.code])
  const playerIdRef = useRef<string>(getOrCreatePlayerId())

  const [state, setState] = useState<ConnectionState>('connecting')
  const [playerCount, setPlayerCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

    return () => { ws.close() }
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

  function handleShare() {
    const url = `${window.location.origin}/room/${roomCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={styles.page}>
      {/* Atmospheric background */}
      <div className={styles.atmoVignette}/>
      <div className={styles.atmoTop}/>
      <div className={styles.atmoBottom}/>
      <div className={styles.atmoNoise}/>

      <div className={styles.card}>
        <CornerDecor pos="tl"/>
        <CornerDecor pos="tr"/>
        <CornerDecor pos="bl"/>
        <CornerDecor pos="br"/>

        {/* Код + пилюля */}
        <div className={styles.topRow}>
          <div className={styles.code}>{roomCode || '??????'}</div>
          <div className={pillClass}>{pillText}</div>
        </div>

        <DiamondDivider/>

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
          {state === 'waiting' && (
            <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 100 100" overflow="visible" fill="#c09ee0" stroke="#a07bc8">
              <defs><polygon id="loader" points="20,40 28,55 12,55"/></defs>
              <use xlinkHref="#loader" transform="rotate(30 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.17s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="0.17s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(60 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.33s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="0.33s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(90 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.50s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="0.50s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(120 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.67s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="0.67s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(150 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.83s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="0.83s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(180 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.00s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="1.00s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(210 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.17s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="1.17s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(240 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.33s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="1.33s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(270 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.50s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="1.50s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(300 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.67s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="1.67s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(330 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.83s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="1.83s" repeatCount="indefinite" from="0" to="1.2"/></use>
              <use xlinkHref="#loader" transform="rotate(360 50 50)"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="2.00s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" additive="sum" dur="2s" begin="2.00s" repeatCount="indefinite" from="0" to="1.2"/></use>
            </svg>
          )}
          {statusText}
        </p>

        <DiamondDivider/>

        {/* Кнопки */}
        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => navigate('/')}>
            ← Назад
          </button>
          {state === 'waiting' && (
            <button
              className={`${styles.btnShare} ${copied ? styles.btnShareCopied : ''}`}
              onClick={handleShare}
            >
              {copied ? 'Скопировано' : 'Отправить код'}
            </button>
          )}
          {state === 'ready' && (
            <button className={styles.btnPrimary} onClick={() => navigate(`/game/${roomCode}`)}>
              Войти в игру
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
