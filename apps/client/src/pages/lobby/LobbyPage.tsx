import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateRoomCode, normalizeRoomCode } from '../../shared/lib/roomCode'
import { getPlayerName, savePlayerName, getOrGeneratePlayerName } from '../../shared/lib/playerName'
import { setRoomPlayerSlot } from '../../shared/lib/playerSlot'
import { useCreateSoloGameMutation } from '../../shared/api/gameApi'
import styles from './LobbyPage.module.css'

export function LobbyPage() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameSaved, setNicknameSaved] = useState(false)

  const [createSoloGame, { isLoading: isSoloLoading }] = useCreateSoloGameMutation()

  const normalizedJoinCode = useMemo(() => normalizeRoomCode(joinCode).slice(0, 6), [joinCode])
  const canJoin = normalizedJoinCode.length === 6

  useEffect(() => {
    const saved = getPlayerName()
    if (saved) {
      setNickname(saved)
      setNicknameSaved(true)
    } else {
      const generated = getOrGeneratePlayerName()
      setNickname(generated)
      setNicknameSaved(false)
    }
  }, [])

  function handleNicknameBlur() {
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
      // В соло мы всегда player-1
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

          {/* Никнейм */}
          <div className={styles.row}>
            <div className={styles.label}>Твоё имя</div>
            <div className={styles.nicknameRow}>
              <input
                className={styles.input}
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setNicknameSaved(false) }}
                onBlur={handleNicknameBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleNicknameBlur()}
                placeholder="Введите ваш никнейм"
                maxLength={24}
                autoCorrect="off"
                spellCheck={false}
              />
              {nicknameSaved && (
                <span className={styles.savedBadge}> ✓ сохранено</span>
              )}
            </div>
          </div>

          {/* Одиночная игра */}
          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSoloGame}
              disabled={isSoloLoading}
            >
              {isSoloLoading ? 'Загрузка...' : 'Одиночная игра'}
            </button>
          </div>

          {/* Создать игру (кооп) */}
          <div className={styles.actions}>
            <button
              className={styles.btn}
              onClick={() => handleEnterRoom(generateRoomCode(6))}
            >
              Создать игру (кооп)
            </button>
          </div>

          {/* Присоединиться */}
          <div className={styles.row}>
            <div className={styles.label}>Код комнаты</div>
            <input
              className={styles.input}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC123"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className={styles.actions}>
              <button
                className={styles.btn}
                disabled={!canJoin}
                onClick={() => handleEnterRoom(normalizedJoinCode)}
              >
                Присоединиться
              </button>
            </div>
            <p className={styles.hint}>
              Формат: <b>A-Z</b> и <b>0-9</b>, 6 символов.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
