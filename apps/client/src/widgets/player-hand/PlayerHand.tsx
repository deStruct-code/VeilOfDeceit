/**
 * PlayerHand — компактная панель локального игрока.
 * Имя | HP | Энергия. По центру.
 */
import type { Player } from '@veil/shared'
import styles from './PlayerHand.module.css'

interface Props {
  player: Player
  isLocal: boolean  // оставлен для совместимости, панель всегда одна
}

export function PlayerHand({ player }: Props) {
  const hpPct   = (player.hp / player.maxHp) * 100
  const hpColor = hpPct > 50 ? 'var(--color-hp)' : hpPct > 25 ? '#f59e0b' : '#ef4444'

  const energyPips = Array.from(
    { length: Math.min(player.maxEnergy, 10) },
    (_, i) => i < player.energy,
  )

  return (
    <div className={styles.panel}>

      <span className={styles.name}>
        {player.name}
        {!player.isAlive && <span className={styles.dead}>☠</span>}
      </span>

      <span className={styles.hp} style={{ color: hpColor }}>
        {player.hp}<span className={styles.hpMax}>/{player.maxHp}</span>
      </span>

      <div className={styles.pips}>
        {energyPips.map((active, i) => (
          <span key={i} className={`${styles.pip} ${active ? styles.pipOn : ''}`} />
        ))}
      </div>

    </div>
  )
}
