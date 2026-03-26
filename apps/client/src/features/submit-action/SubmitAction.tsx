import type { GameState } from '@veil/shared'
import { useSubmitActionMutation } from '../../shared/api/gameApi'
import styles from './SubmitAction.module.css'

interface Props {
  game: GameState
  selectedCardIds: string[]
  playerId: string
}

export function SubmitAction({ game, selectedCardIds, playerId }: Props) {
  const [submitAction, { isLoading }] = useSubmitActionMutation()
  const me = game.players.find(p => p.id === playerId)!
  const ally = game.players.find(p => p.id !== playerId)!

  const canSubmit = selectedCardIds.length > 0 && !me.submitted && !isLoading

  const handleSubmit = async () => {
    if (!canSubmit) return
    await submitAction({ gameId: game.id, playerId, cardIds: selectedCardIds })
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
            : selectedCardIds.length > 0 ? 'Commit' : 'Pick cards'}
      </button>
    </div>
  )
}
