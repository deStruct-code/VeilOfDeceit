import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { generateRoomCode, normalizeRoomCode } from '../../shared/lib/roomCode'
import { getPlayerName, savePlayerName, getOrGeneratePlayerName } from '../../shared/lib/playerName'
import { setRoomPlayerSlot } from '../../shared/lib/playerSlot'
import { useCreateSoloGameMutation } from '../../shared/api/gameApi'
import { useMe } from '../../shared/lib/useMe'
import styles from './LobbyPage.module.css'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') || 'http://localhost:8000'

export function LobbyPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { me, isLoading: isMeLoading, logout } = useMe()

  const [joinCode, setJoinCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameSaved, setNicknameSaved] = useState(false)
  const [authError, setAuthError] = useState(false)

  const [createSoloGame, { isLoading: isSoloLoading }] = useCreateSoloGameMutation()

  const normalizedJoinCode = useMemo(() => normalizeRoomCode(joinCode).slice(0, 6), [joinCode])
  const canJoin = normalizedJoinCode.length === 6

  useEffect(() => {
    if (searchParams.get('auth') === 'error') setAuthError(true)
  }, [searchParams])

  // Никнейм: приоритет у Google аккаунта, потом localStorage
  useEffect(() => {
    if (me) {
      setNickname(me.name)
      setNicknameSaved(true)
      savePlayerName(me.name)
      return
    }
    const saved = getPlayerName()
    if (saved) {
      setNickname(saved)
      setNicknameSaved(true)
    } else {
      setNickname(getOrGeneratePlayerName())
      setNicknameSaved(false)
    }
  }, [me])

  function handleNicknameBlur() {
    if (me) return
    const trimmed = nickname.trim().slice(0, 24)
    if (trimmed) {
      savePlayerName(trimmed)
      setNickname(trimmed)
      setNicknameSaved(true)
    }
  }

  function handleEnterRoom(code: string) {
    const trimmed = nickname.trim().slice(0, 24)
    if (trimmed) savePlayerName(trimmed)
    navigate(`/room/${code}`)
  }

  async function handleSoloGame() {
    const trimmed = nickname.trim().slice(0, 24)
    if (trimmed) savePlayerName(trimmed)
    const gameId = generateRoomCode(6)
    const playerName = trimmed || getOrGeneratePlayerName()
    try {
      await createSoloGame({ gameId, playerName }).unwrap()
      setRoomPlayerSlot(gameId, 'player-1')
      navigate(`/game/${gameId}`)
    } catch (err) {
      console.error('[solo]', err)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Veil of Deceit</h1>
        <p className={styles.subtitle}>
          Кооператив на двоих. Создай комнату или присоединись по коду.
        </p>

        <div className={styles.grid}>

          {/* ── Аккаунт / кнопка входа ── */}
          {isMeLoading ? (
            <div className={styles.accountLoading}>...</div>
          ) : me ? (
            <div className={styles.account}>
              {me.avatar && (
                <img src={me.avatar} alt={me.name} className={styles.avatar} referrerPolicy="no-referrer" />
              )}
              <div className={styles.accountInfo}>
                <span className={styles.accountName}>{me.name}</span>
                <span className={styles.accountEmail}>{me.email}</span>
              </div>
              <button className={styles.logoutBtn} onClick={logout}>Выйти</button>
            </div>
          ) : (
            <div className={styles.authBlock}>
              {authError && (
                <p className={styles.authError}>Ошибка авторизации. Попробуй снова.</p>
              )}
              <button className={styles.googleBtn} onClick={() => { window.location.href = `${API_URL}/auth/google` }}>
                <GoogleIcon />
                Войти через Google
              </button>
            </div>
          )}

          <div className={styles.divider} />

          {/* ── Никнейм ── */}
          <div className={styles.row}>
            <div className={styles.label}>Имя героя</div>
            <div className={styles.nicknameRow}>
              <input
                className={styles.input}
                value={nickname}
                onChange={(e) => { if (!me) { setNickname(e.target.value); setNicknameSaved(false) } }}
                onBlur={handleNicknameBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleNicknameBlur()}
                placeholder="Введите ваш никнейм"
                maxLength={24}
                autoCorrect="off"
                spellCheck={false}
                readOnly={!!me}
              />
              //fix this 
              {nicknameSaved && (
                <span className={styles.savedBadge}>{me ? '● Google' : ''}</span>
              )}
            </div>
          </div>

          <div className={styles.divider} />

          {/* ── Кнопки игры ── */}
          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSoloGame} disabled={isSoloLoading}>
              {isSoloLoading ? 'Загрузка...' : 'Одиночная игра'}
            </button>
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnDuo}`} onClick={() => handleEnterRoom(generateRoomCode(6))}>
              Игра вдвоём
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.label}>Код комнаты</div>
            <input
              className={styles.inputCode}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC123"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnDuo}`} disabled={!canJoin} onClick={() => handleEnterRoom(normalizedJoinCode)}>
                Присоединиться
              </button>
            </div>
            {/* <p className={styles.hint}>Формат: <b>A-Z</b> и <b>0-9</b>, 6 символов.</p> */}
          </div>

        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}