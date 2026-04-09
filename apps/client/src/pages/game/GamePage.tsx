import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  useGetGameQuery,
  useSubmitActionMutation,
  useResetGameMutation,
} from '../../shared/api/gameApi'
import { getRoomPlayerSlot } from '../../shared/lib/playerSlot'
import styles from './GamePage.module.css'

const TURN_SECONDS = 20

export function GamePage() {
  const params = useParams()
  const gameId = useMemo(() => String(params.code ?? '').toUpperCase(), [params.code])
  const localPlayerId = useMemo(() => getRoomPlayerSlot(gameId) ?? 'player-1', [gameId])

  const { data: game, isLoading, isError } = useGetGameQuery(gameId, { pollingInterval: 1000 })
  const [submitAction] = useSubmitActionMutation()
  const [resetGame] = useResetGameMutation()

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [showOverlay, setShowOverlay] = useState(false)
  const [prevPhase, setPrevPhase] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(TURN_SECONDS)

  const handleSkip = useCallback(async () => {
    if (!game) return
    const me = game.players.find((p) => p.id === localPlayerId)
    if (!me || me.submitted) return
    await submitAction({ gameId: game.id, playerId: localPlayerId, cardIds: [] })
  }, [game, localPlayerId, submitAction])

  const handleSkipRef = useRef(handleSkip)
  handleSkipRef.current = handleSkip

  useEffect(() => {
    if (!game?.turnDeadline || game.phase !== 'action') return
    const tick = () => {
      const left = Math.max(0, Math.ceil((game.turnDeadline! - Date.now()) / 1000))
      setTimeLeft(left)
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [game?.turnDeadline, game?.phase])

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
    const localPlayer = game.players.find((p) => p.id === localPlayerId)!
    if (!localPlayer.isAlive) return
    const card = localPlayer.hand.find((c) => c.id === cardId)
    if (!card) return
    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId)
      const usedEnergy = localPlayer.hand
        .filter((c) => prev.includes(c.id))
        .reduce((sum, c) => sum + c.cost, 0)
      if (usedEnergy + card.cost > localPlayer.energy) return prev
      return [...prev, cardId]
    })
  }

  if (isLoading) return <div className={styles.loading}>Entering the void<span className={styles.dots}>...</span></div>
  if (isError || !game) return <div className={styles.loading}>Failed to reach the server.</div>

  return (
    <div className={styles.layout} />
  )
}
