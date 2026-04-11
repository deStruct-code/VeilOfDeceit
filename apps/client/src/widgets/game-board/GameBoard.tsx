import type { GameState } from '@veil/shared'
import type { CardBackId } from '../../entities/card/cardBack'
import { BossPanel } from '../boss-panel/BossPanel'
import { PlayerHand } from '../player-hand/PlayerHand'
import { MyHand } from '../my-hand'
import { AllyHandStack } from '../ally-hand-stack'
import { RevealOverlay } from '../reveal-overlay/RevealOverlay'
import { DeckStack, DiscardStack } from '../deck-stack'
import { getAllyCardBack } from '../../shared/lib/playerSlot'
import styles from './GameBoard.module.css'

interface Props {
  game: GameState
  localPlayerId: string
  selectedCardIds: string[]
  timeLeft: number
  showOverlay: boolean
  onSelect: (cardId: string) => void
  onSkip: () => void
  onReset: () => void
  onContinue: () => void
}

export function GameBoard({
  game,
  localPlayerId,
  selectedCardIds,
  timeLeft,
  showOverlay,
  onSelect,
  onSkip,
  onContinue,
}: Props) {
  const me   = game.players.find(p => p.id === localPlayerId)!
  const ally = game.players.find(p => p.id !== localPlayerId)!

  const allyCardBackId = getAllyCardBack(game.id) as CardBackId
  const sharedDeckCount = me.deckCount ?? 0

  const usedEnergy = me.hand
    .filter(c => selectedCardIds.includes(c.id))
    .reduce((sum, c) => sum + c.cost, 0)

  const isActionPhase = game.phase === 'action'
  const canAct = isActionPhase && me.isAlive && !me.submitted

  return (
    <div className={styles.board}>

      {/* ══════ TOP BAR: лог | босс | таймер ══════ */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.logList}>
            {[...game.log].reverse().slice(0, 4).map((entry, i) => (
              <p key={i} className={`${styles.logLine} ${styles[entry.type ?? 'system']}`}>
                {entry.text}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.topCenter}>
          <BossPanel boss={game.boss as any} />
        </div>

        <div className={styles.topRight}>
          {isActionPhase && (
            <div className={styles.timerBlock}>
              <span className={`${styles.timerDigit} ${timeLeft <= 5 ? styles.timerUrgent : ''}`}>
                {timeLeft}
              </span>
              <span className={styles.timerLabel}>sec</span>
            </div>
          )}
          <div className={styles.turnBadge}>Turn {game.turn}</div>
        </div>
      </div>

      {/* ══════ ARENA: фон + карты союзника + колода + сброс ══════ */}
      <div className={styles.arena}>

        {/* Карты союзника — центр арены, "вдалеке" */}
        <div className={styles.allyHandArea}>
          <AllyHandStack
            cardCount={ally.hand.length}
            cardBackId={allyCardBackId}
          />
        </div>

        {/* Колода — правый угол */}
        <div className={styles.deckArea}>
          <DeckStack count={sharedDeckCount} label="Deck" />
        </div>

        {/* Сброс — левый угол */}
        <div className={styles.discardArea}>
          <DiscardStack count={game.sharedDiscardPile.length} label="Discard" />
        </div>
      </div>

      {/* ══════ BOTTOM AREA: статы + мои карты + кнопки ══════ */}
      <div className={styles.bottomArea}>

        {/* Панель статов — только свои данные */}
        <div className={styles.statsRow}>
          <PlayerHand player={me} isLocal={true} />
        </div>

        {/* Карты игрока — крупные, по центру */}
        <div className={styles.myHandZone}>
          <MyHand
            cards={me.hand}
            selectedCardIds={selectedCardIds}
            onSelect={canAct ? onSelect : () => {}}
            usedEnergy={usedEnergy}
            maxEnergy={me.energy}
            disabled={!canAct}
          />
        </div>

        {/* Кнопки */}
        {canAct && (
          <div className={styles.actionsBar}>
            {selectedCardIds.length > 0 && (
              <button className={styles.btnSubmit} onClick={() => onSelect('')}>
                Play {selectedCardIds.length} card{selectedCardIds.length > 1 ? 's' : ''}
              </button>
            )}
            <button className={styles.btnSkip} onClick={onSkip}>
              Skip turn
            </button>
          </div>
        )}
      </div>

      {/* ══════ OVERLAY ══════ */}
      {showOverlay && (
        <RevealOverlay
          game={game}
          localPlayerId={localPlayerId}
          onContinue={onContinue}
        />
      )}
    </div>
  )
}
