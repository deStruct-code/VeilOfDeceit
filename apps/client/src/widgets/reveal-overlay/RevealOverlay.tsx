import { useState, useEffect } from 'react'
import type { GameState, RevealEntry } from '@veil/shared'
import { FlippableCard } from '../../entities/card/ui/FlippableCard'
import styles from './RevealOverlay.module.css'

interface Props {
  game: GameState
  localPlayerId: string
  onContinue: () => void
}

const FLIP_DELAY_MS = 500   // пауза между переворотами карт
const LINGER_MS    = 1200   // сколько висит после последнего флипа до авто-продолжения

const END_PHASES = new Set(['defeat', 'victory'])

export function RevealOverlay({ game, localPlayerId, onContinue }: Props) {
  const reveals: RevealEntry[] = game.lastReveal ?? []
  const isEnd = END_PHASES.has(game.phase)

  // Индекс последней раскрытой карты (-1 = ни одной)
  const [revealedUpTo, setRevealedUpTo] = useState(-1)
  // Карты "выехали" в центр
  const [cardsVisible, setCardsVisible] = useState(false)

  // Сброс при каждом новом открытии оверлея
  useEffect(() => {
    setRevealedUpTo(-1)
    setCardsVisible(false)

    if (reveals.length === 0) return

    // 1. Карты появляются рубашками (короткая задержка)
    const t0 = setTimeout(() => setCardsVisible(true), 80)

    // 2. Переворачиваем по очереди каждые FLIP_DELAY_MS
    const timers: ReturnType<typeof setTimeout>[] = [t0]
    reveals.forEach((_, i) => {
      const t = setTimeout(
        () => setRevealedUpTo(i),
        300 + i * FLIP_DELAY_MS,
      )
      timers.push(t)
    })

    // 3. Для не-финальных фаз — автоматически продолжаем после последнего флипа
    if (!isEnd) {
      const autoT = setTimeout(
        onContinue,
        300 + reveals.length * FLIP_DELAY_MS + LINGER_MS,
      )
      timers.push(autoT)
    }

    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turn, game.phase])

  function playerLabel(playerId: string) {
    const p = game.players.find(p => p.id === playerId)
    const name = p?.name ?? playerId
    return playerId === localPlayerId ? `${name} (you)` : name
  }

  return (
    <div className={styles.overlay}>

      {/* Карты в центре арены */}
      <div className={`${styles.cardRow} ${cardsVisible ? styles.cardRowVisible : ''}`}>
        {reveals.map((r, i) => (
          <div key={r.playerId} className={styles.cardSlot}>
            <FlippableCard
              card={r.card}
              revealed={revealedUpTo >= i}
              delay={0}   // задержку управляем сами через revealedUpTo
            />
            {/* Имя под картой появляется вместе с флипом */}
            <span className={`${styles.cardOwner} ${revealedUpTo >= i ? styles.cardOwnerVisible : ''} ${r.playerId === localPlayerId ? styles.cardOwnerLocal : ''}`}>
              {playerLabel(r.playerId)}
            </span>
          </div>
        ))}
      </div>

      {/* Эффекты — появляются после всех флипов */}
      {revealedUpTo >= reveals.length - 1 && reveals.length > 0 && (
        <div className={styles.effects}>
          {reveals.map((r) => (
            <div key={r.playerId} className={styles.effectRow}>
              <span className={`${styles.effectName} ${r.playerId === localPlayerId ? styles.effectNameLocal : ''}`}>
                {playerLabel(r.playerId)}
              </span>
              <span className={styles.effectCard}>{r.card.name}</span>
              {r.damageDealt   != null && <span className={styles.effectDmg}>−{r.damageDealt} to boss</span>}
              {r.shieldGained  != null && <span className={styles.effectShield}>+{r.shieldGained} shield</span>}
              {r.statusApplied        && <span className={styles.effectStatus}>{r.statusApplied.type} ×{r.statusApplied.stacks}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Кнопка только для финальных фаз или если нет карт */}
      {(isEnd || reveals.length === 0) && (
        <button className={`${styles.btn} ${isEnd ? styles.btnEnd : ''}`} onClick={onContinue}>
          {game.phase === 'defeat' ? 'Try Again' : game.phase === 'victory' ? 'Play Again' : 'Continue →'}
        </button>
      )}
    </div>
  )
}
