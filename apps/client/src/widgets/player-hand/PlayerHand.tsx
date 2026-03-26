import type { Card, Player, StatusEffect } from '../../shared/types/game'
import styles from './PlayerHand.module.css'

interface Props {
  player: Player
  isLocal: boolean
  selectedCardId: string | null
  onSelect: (cardId: string) => void
}

const typeColors: Record<string, string> = {
  attack: 'var(--color-attack)',
  defense: 'var(--color-defense)',
  support: 'var(--color-support)',
  special: 'var(--color-special)',
  hidden: 'var(--color-hidden)',
}

const statusColors: Record<string, string> = {
  poison: '#4ade80', weakness: '#a855f7', shield: '#60a5fa',
}

function CardItem({ card, selected, onSelect, disabled }: {
  card: Card; selected: boolean; onSelect: () => void; disabled: boolean
}) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
      onClick={onSelect}
      disabled={disabled}
      style={{ '--accent': typeColors[card.type] } as React.CSSProperties}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardType}>{card.type}</span>
        {card.cost > 0 && <span className={styles.cardCost}>{card.cost}⚡</span>}
      </div>
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardBottom}>
        {card.value > 0 && <span className={styles.cardValue}>{card.value}</span>}
        {card.effect && <span className={styles.cardEffect}>{card.effect}</span>}
      </div>
    </button>
  )
}

function CardBack() {
  return (
    <div className={styles.cardBack}>
      <div className={styles.cardBackInner}>
        <span className={styles.cardBackGlyph}>⚔</span>
      </div>
    </div>
  )
}

export function PlayerHand({ player, isLocal, selectedCardId, onSelect }: Props) {
  const hpPct = (player.hp / player.maxHp) * 100
  const hpColor = hpPct > 50 ? 'var(--color-hp)' : hpPct > 25 ? '#f59e0b' : '#ef4444'
  const energyPips = Array.from({ length: player.maxEnergy }, (_, i) => i < player.energy)

  return (
    <div className={`${styles.container} ${isLocal ? styles.local : styles.ally}`}>
      <div className={styles.playerInfo}>
        <span className={styles.playerName}>{player.name}</span>

        <div className={styles.hpGroup}>
          <div className={styles.hpBar}>
            <div className={styles.hpFill} style={{ width: `${hpPct}%`, background: hpColor }} />
          </div>
          <span className={styles.hpText}>{player.hp}/{player.maxHp}</span>
        </div>

        <div className={styles.energy}>
          {energyPips.map((active, i) => (
            <span key={i} className={`${styles.pip} ${active ? styles.pipActive : ''}`} />
          ))}
        </div>

        {player.shield > 0 && (
          <span className={styles.shieldBadge}>🛡 {player.shield}</span>
        )}

        {player.statuses.map((s: StatusEffect) => (
          <span
            key={s.type}
            className={styles.statusBadge}
            style={{ color: statusColors[s.type] }}
          >
            {s.type} ×{s.stacks}
          </span>
        ))}

        {player.submitted && (
          <span className={styles.submitted}>✓ ready</span>
        )}
      </div>

      <div className={styles.hand}>
        {isLocal
          ? player.hand.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                selected={selectedCardId === card.id}
                onSelect={() => onSelect(card.id)}
                disabled={player.submitted || card.type === 'hidden'}
              />
            ))
          : player.hand.map((_, i) => (
              <CardBack key={i} />
            ))
        }
      </div>
    </div>
  )
}
