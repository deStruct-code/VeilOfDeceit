import type { GameState } from '../../shared/types/game'
import { useSubmitActionMutation } from '../../shared/api/gameApi'
import styles from './SubmitAction.module.css'

interface Props {
  game: GameState
  selectedCardId: string | null
  playerId: string
}

export function SubmitAction({ game, selectedCardId, playerId }: Props) {
  const [submitAction, { isLoading }] = useSubmitActionMutation()
  const me = game.players.find(p => p.id === playerId)!
  const ally = game.players.find(p => p.id !== playerId)!

  const canSubmit = !!selectedCardId && !me.submitted && !isLoading

  const handleSubmit = async () => {
    if (!canSubmit) return
    await submitAction({ gameId: game.id, playerId, cardId: selectedCardId! })
  }

  return (
    <div className={styles.zone}>
      <div className={styles.allyStatus}>
        <div className={`${styles.dot} ${ally.submitted ? styles.dotReady : styles.dotWaiting}`} />
        <span className={styles.statusText}>
          {ally.submitted ? `${ally.name} is ready` : `${ally.name} is thinking...`}
        </span>
      </div>

      <button
        className={`${styles.submitBtn} ${me.submitted ? styles.submitted : ''} ${!canSubmit && !me.submitted ? styles.idle : ''}`}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {isLoading
          ? 'Resolving...'
          : me.submitted
            ? '✓ Committed'
            : selectedCardId
              ? 'Commit'
              : 'Pick a card'}
      </button>
    </div>
  )
}
