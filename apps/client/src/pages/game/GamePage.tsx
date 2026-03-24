import { useState, useEffect } from 'react'
import { useGetGameQuery, useSubmitActionMutation, useResetGameMutation } from '../../shared/api/gameApi'
import { BossPanel } from '../../widgets/boss-panel/BossPanel'
import { PlayerHand } from '../../widgets/player-hand/PlayerHand'
import { SubmitAction } from '../../features/submit-action/SubmitAction'
import { RevealOverlay } from '../../widgets/reveal-overlay/RevealOverlay'
import styles from './GamePage.module.css'

const GAME_ID = 'game-001'
const LOCAL_PLAYER_ID = 'player-1'

export function GamePage() {
  const { data: game, isLoading, isError } = useGetGameQuery(GAME_ID, {
    pollingInterval: 2000,
  })
  const [, { reset: resetQuery }] = useSubmitActionMutation({ fixedCacheKey: 'submit' })
  const [resetGame] = useResetGameMutation()

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [prevPhase, setPrevPhase] = useState<string | null>(null)

  // Show overlay when phase changes away from 'action'
  useEffect(() => {
    if (!game) return
    if (game.phase !== 'action' && game.phase !== prevPhase) {
      setShowOverlay(true)
    }
    setPrevPhase(game.phase)
    // Reset card selection when new turn starts
    if (game.phase === 'action' && prevPhase && prevPhase !== 'action') {
      setSelectedCardId(null)
    }
  }, [game?.phase])

  const handleContinue = async () => {
    if (!game) return
    if (game.phase === 'defeat' || game.phase === 'victory') {
      await resetGame()
      setSelectedCardId(null)
    }
    setShowOverlay(false)
  }

  if (isLoading) return (
    <div className={styles.loading}>
      Entering the void<span className={styles.dots}>...</span>
    </div>
  )
  if (isError || !game) return (
    <div className={styles.loading}>Failed to reach the server.</div>
  )

  const localPlayer = game.players.find(p => p.id === LOCAL_PLAYER_ID)!
  const allyPlayer = game.players.find(p => p.id !== LOCAL_PLAYER_ID)!
  const recentLogs = [...game.log].slice(-3)

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <span className={styles.turnLabel}>Turn {game.turn}</span>
        <span className={`${styles.phase} ${styles[game.phase]}`}>
          {game.phase.replace('_', ' ')}
        </span>
        <button className={styles.resetBtn} onClick={async () => { await resetGame(); setSelectedCardId(null) }}>
          ↺
        </button>
      </header>

      <BossPanel boss={game.boss} />

      <div className={styles.log}>
        {recentLogs.map((entry, i) => (
          <p key={i} className={`${styles.logEntry} ${styles[entry.type ?? 'system']}`}>
            <span className={styles.logTurn}>T{entry.turn}</span>
            {entry.text}
          </p>
        ))}
      </div>

      <div className={styles.hands}>
        <PlayerHand
          player={allyPlayer}
          isLocal={false}
          selectedCardId={null}
          onSelect={() => {}}
        />
        <PlayerHand
          player={localPlayer}
          isLocal={true}
          selectedCardId={selectedCardId}
          onSelect={setSelectedCardId}
        />
      </div>

      <SubmitAction
        game={game}
        selectedCardId={selectedCardId}
        playerId={LOCAL_PLAYER_ID}
      />

      {showOverlay && (
        <RevealOverlay game={game} onContinue={handleContinue} />
      )}
    </div>
  )
}
