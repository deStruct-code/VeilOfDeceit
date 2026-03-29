import type { GameState } from '@veil/shared'
import { useSubmitActionMutation } from '../../shared/api/gameApi'
import styles from './SubmitAction.module.css'

interface Props {
  game: GameState
  selectedCardIds: string[]
  playerId: string
  onSkip: () => void
}

export function SubmitAction({ game, selectedCardIds, playerId, onSkip }: Props) {
  const [submitAction, { isLoading }] = useSubmitActionMutation()
  const me = game.players.find(p => p.id === playerId)!
  const ally = game.players.find(p => p.id !== playerId)!

  const hasCards = selectedCardIds.length > 0

  const handleClick = async () => {
    if (me.submitted || isLoading) return
    if (hasCards) {
      await submitAction({ gameId: game.id, playerId, cardIds: selectedCardIds })
    } else {
      onSkip()
    }
  }

  const label = isLoading
    ? 'Resolving...'
    : me.submitted
      ? '✓ Committed'
      : hasCards ? 'Commit' : 'Skip'

  return (
    <div className={styles.zone}>
      <div className={styles.allyStatus}>
        <div className={`${styles.dot} ${ally.submitted ? styles.dotReady : styles.dotWaiting}`} />
        <span className={styles.statusText}>
          {ally.submitted ? `${ally.name} is ready` : `${ally.name} is thinking...`}
        </span>
      </div>

      <button
        className={`${styles.submitBtn} ${me.submitted ? styles.submitted : ''} ${!hasCards && !me.submitted ? styles.skip : ''}`}
        onClick={handleClick}
        disabled={me.submitted || isLoading}
      >
        {label}
      </button>
    </div>
  )
}