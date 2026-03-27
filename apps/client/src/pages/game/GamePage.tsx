import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  useGetGameQuery,
  useSubmitActionMutation,
  useResetGameMutation,
} from '../../shared/api/gameApi'
import { SubmitAction } from '../../features/submit-action/SubmitAction'
import { RevealOverlay } from '../../widgets/reveal-overlay/RevealOverlay'
import { PlayerHand } from '../../widgets/player-hand/PlayerHand'
import { getRoomPlayerSlot } from '../../shared/lib/playerSlot'
import type { BossState, Player, StatusEffect } from '@veil/shared'
import styles from './GamePage.module.css'

// ─── Boss cell ────────────────────────────────────────────────────────────────

function BossCell({ boss, turn, phase, onReset }: {
  boss: BossState
  turn: number
  phase: string
  onReset: () => void
}) {
  const hpPct = (boss.hp / boss.maxHp) * 100
  const phaseColor = boss.phase === 1 ? 'var(--phase-1)' : 'var(--phase-2)'
  const action = boss.nextAction

  return (
    <div className={styles.bossCell}>
      <div className={styles.bossControls}>
        <span className={styles.turnLabel}>Turn {turn}</span>
        <span className={`${styles.phase} ${styles[phase]}`}>
          {phase.replace('_', ' ')}
        </span>
        <button className={styles.resetBtn} onClick={onReset}>↺</button>
      </div>

      <div className={styles.bossName} style={{ color: phaseColor }}>
        {boss.name}
      </div>

      <div className={styles.bossHpRow}>
        <div className={styles.bossHpBar}>
          <div
            className={styles.bossHpFill}
            style={{ width: `${hpPct}%`, background: phaseColor }}
          />
        </div>
        <span className={styles.bossHpText}>{boss.hp} / {boss.maxHp}</span>
      </div>

      <div className={styles.bossNextAction}>
        <span>⚔</span>
        <span>{action.label}</span>
        {action.damage && (
          <span className={styles.actionDmg}>−{action.damage}</span>
        )}
        <span className={styles.actionTarget}>→ {action.target}</span>
      </div>

      {boss.statuses.length > 0 && (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {boss.statuses.map((s: StatusEffect) => (
            <span key={s.type} className={styles.statusBadge}
              style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
              {s.type} ×{s.stacks}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Player bar ───────────────────────────────────────────────────────────────

function PlayerBar({ player, isLocal }: { player: Player; isLocal: boolean }) {
  const hpPct = (player.hp / player.maxHp) * 100
  const hpColor = hpPct > 50 ? 'var(--color-hp)' : hpPct > 25 ? '#f59e0b' : '#ef4444'

  return (
    <div className={styles.playerBar}>
      <span className={styles.playerName}>
        {player.name}{isLocal ? ' (you)' : ''}
      </span>
      <div className={styles.hpGroup}>
        <div className={styles.hpBar}>
          <div className={styles.hpFill} style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
        <span className={styles.hpText}>{player.hp}/{player.maxHp}</span>
      </div>
      {player.shield > 0 && (
        <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
          🛡{player.shield}
        </span>
      )}
      {player.submitted && (
        <span className={styles.submittedBadge}>✓</span>
      )}
    </div>
  )
}

// ─── Energy row ───────────────────────────────────────────────────────────────

function EnergyCell({ player }: { player: Player }) {
  const pips = Array.from({ length: player.maxEnergy }, (_, i) => i < player.energy)
  // показываем только первые 10 пипов чтобы не переполнить
  const visible = pips.slice(0, 10)

  return (
    <div className={styles.energyCell}>
      {visible.map((active, i) => (
        <span key={i} className={`${styles.pip} ${active ? styles.pipActive : ''}`} />
      ))}
      <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginLeft: '0.25rem' }}>
        {player.energy} Энергия: ⚡
      </span>
    </div>
  )
}

// ─── Deck widget ──────────────────────────────────────────────────────────────

function DeckCell({ player }: { player: Player }) {
  return (
    <div className={styles.deckCell}>
      <div className={styles.deckIcon}>
        {(player.deck as any[]).length}
      </div>
      <span className={styles.deckCount}>{(player.deck as any[]).length}</span>
      <span className={styles.deckLabel}>Колода</span>
      <span className={styles.deckCount} style={{ color: 'var(--text-dim)' }}>
        +{(player.discardPile as any[]).length} Сброс
      </span>
    </div>
  )
}

// ─── GamePage ─────────────────────────────────────────────────────────────────

export function GamePage() {
  const params = useParams()
  const gameId = useMemo(() => String(params.code ?? '').toUpperCase(), [params.code])
  const localPlayerId = useMemo(() => getRoomPlayerSlot(gameId) ?? 'player-1', [gameId])

  const { data: game, isLoading, isError } = useGetGameQuery(gameId, { pollingInterval: 1000 })
  const [resetGame] = useResetGameMutation()

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [showOverlay, setShowOverlay] = useState(false)
  const [prevPhase, setPrevPhase] = useState<string | null>(null)

  useEffect(() => {
    if (!game) return
    if (game.phase !== 'action' && game.phase !== prevPhase) setShowOverlay(true)
    setPrevPhase(game.phase)
    if (game.phase === 'action' && prevPhase && prevPhase !== 'action') setSelectedCardIds([])
  }, [game?.phase])

  const handleContinue = async () => {
    if (!game) return
    if (game.phase === 'defeat' || game.phase === 'victory') {
      await resetGame({ gameId })
      setSelectedCardIds([])
    }
    setShowOverlay(false)
  }

  const handleReset = async () => {
    await resetGame({ gameId })
    setSelectedCardIds([])
  }

  const handleSelect = (cardId: string) => {
    if (!game) return
    const localPlayer = game.players.find(p => p.id === localPlayerId)!
    const card = localPlayer.hand.find(c => c.id === cardId)
    if (!card) return

    setSelectedCardIds(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId)
      const usedEnergy = localPlayer.hand
        .filter(c => prev.includes(c.id))
        .reduce((sum, c) => sum + c.cost, 0)
      if (usedEnergy + card.cost > localPlayer.energy) return prev
      return [...prev, cardId]
    })
  }

  if (isLoading) return (
    <div className={styles.loading}>
      Entering the void<span className={styles.dots}>...</span>
    </div>
  )
  if (isError || !game) return (
    <div className={styles.loading}>Failed to reach the server.</div>
  )

  const localPlayer = game.players.find(p => p.id === localPlayerId)!
  const allyPlayer  = game.players.find(p => p.id !== localPlayerId)!
  const recentLogs  = [...game.log].slice(-4)

  return (
    <div className={styles.layout}>

      {/* ── Row 1: Log | Boss | Info ── */}

      <div className={styles.log}>
        {recentLogs.map((entry, i) => (
          <p key={i} className={`${styles.logEntry} ${styles[entry.type ?? 'system']}`}>
            <span className={styles.logTurn}>T{entry.turn}</span>
            {entry.text}
          </p>
        ))}
      </div>

      <BossCell
        boss={game.boss}
        turn={game.turn}
        phase={game.phase}
        onReset={handleReset}
      />

      <div className={styles.infoCell}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Room</span>
          <span className={styles.infoValue}>{gameId}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Phase</span>
          <span className={styles.infoValue}>Boss {game.boss.phase}</span>
        </div>
        {game.boss.statuses.map((s: StatusEffect) => (
          <div key={s.type} className={styles.infoRow}>
            <span className={styles.infoLabel}>{s.type}</span>
            <span className={styles.infoValue}>×{s.stacks}</span>
          </div>
        ))}
      </div>

      {/* ── Row 2-4: Arena ── */}

      <div className={styles.arenaLeft} />

      <div className={styles.arenaCenter}>
        <span className={styles.arenaPlaceholder}>arena</span>
      </div>

      <div className={styles.arenaRight} />

      <DeckCell player={localPlayer} />

      {/* ── Row 5: Player bars ── */}

      <div className={styles.playerBars}>
        <PlayerBar player={localPlayer} isLocal={true} />
        <PlayerBar player={allyPlayer}  isLocal={false} />
      </div>

      {/* ── Row 6: Energy ── */}

      <div className={styles.energyRow}>
        <EnergyCell player={localPlayer} />
        <EnergyCell player={allyPlayer} />
      </div>

      {/* ── Row 7: Hands ── */}

      <div className={styles.handsRow}>
        <div className={styles.handCell}>
          <PlayerHand
            player={localPlayer}
            isLocal={true}
            selectedCardIds={selectedCardIds}
            onSelect={handleSelect}
          />
          <SubmitAction
            game={game}
            selectedCardIds={selectedCardIds}
            playerId={localPlayerId}
          />
        </div>
        <div className={styles.handCell}>
          <PlayerHand
            player={allyPlayer}
            isLocal={false}
            selectedCardIds={[]}
            onSelect={() => {}}
          />
        </div>
      </div>

      {showOverlay && (
        <RevealOverlay
          game={game}
          localPlayerId={localPlayerId}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}
