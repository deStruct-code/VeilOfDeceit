import type { GameState } from '../../shared/types/game'
import styles from './RevealOverlay.module.css'

interface Props {
  game: GameState
  localPlayerId: string
  onContinue: () => void
}

const phaseLabel: Record<string, string> = {
  reveal: 'Cards Revealed',
  boss_attack: 'Boss Attacks',
  new_cards: 'New Turn',
  defeat: 'Defeated',
  victory: 'Victory',
}

export function RevealOverlay({ game, localPlayerId, onContinue }: Props) {
  const isEnd = game.phase === 'defeat' || game.phase === 'victory'
  const recentLogs = [...game.log].reverse().slice(0, 5)

  // Имя по playerId из реального состояния игры
  function playerLabel(playerId: string): string {
    const player = game.players.find(p => p.id === playerId)
    const name = player?.name ?? playerId
    return playerId === localPlayerId ? `${name} (you)` : name
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={`${styles.phaseLabel} ${styles[game.phase]}`}>
          {phaseLabel[game.phase] ?? game.phase}
        </div>

        {game.lastReveal && game.lastReveal.length > 0 && (
          <div className={styles.reveals}>
            {game.lastReveal.map((r) => (
              <div key={r.playerId} className={`${styles.revealRow} ${r.playerId === localPlayerId ? styles.revealRowLocal : ''}`}>
                <span className={styles.revealPlayer}>{playerLabel(r.playerId)}</span>
                <span className={styles.revealCard}>{r.card.name}</span>
                {r.damageDealt != null && (
                  <span className={styles.revealDmg}>−{r.damageDealt} to boss</span>
                )}
                {r.shieldGained != null && (
                  <span className={styles.revealShield}>+{r.shieldGained} shield</span>
                )}
                {r.statusApplied && (
                  <span className={styles.revealStatus}>
                    {r.statusApplied.type} ×{r.statusApplied.stacks}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.log}>
          {recentLogs.reverse().map((entry, i) => (
            <p key={i} className={`${styles.logLine} ${styles[entry.type ?? 'system']}`}>
              {entry.text}
            </p>
          ))}
        </div>

        <button className={`${styles.btn} ${isEnd ? styles.btnEnd : ''}`} onClick={onContinue}>
          {game.phase === 'defeat' ? 'Try Again' : game.phase === 'victory' ? 'Play Again' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
