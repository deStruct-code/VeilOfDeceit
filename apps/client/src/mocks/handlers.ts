import { http, HttpResponse, delay } from 'msw'
import type { GameState, Player, StatusEffect } from '@veil/shared'
import { initialGameState, ALL_CARDS, randomBossAction } from './game.mock'

// Deep clone helper
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x))

let state: GameState = clone(initialGameState)

// ── helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Тянет count карт из sharedDeck в руку игрока */
function drawFromShared(s: GameState, player: Player, count: number): void {
  for (let i = 0; i < count; i++) {
    if (player.hand.length >= player.handLimit) break

    if (s.sharedDeck.length === 0) {
      if (s.sharedDiscardPile.length === 0) break
      s.sharedDeck = shuffle(s.sharedDiscardPile)
      s.sharedDiscardPile = []
    }

    const card = s.sharedDeck.pop()!
    player.hand.push({ ...card, id: `${card.baseId}_${Date.now()}_${i}` })
  }
  // Синхронизируем deckCount у обоих
  const dc = s.sharedDeck.length
  for (const p of s.players) p.deckCount = dc
}

function applyDamage(player: Player, raw: number): number {
  const weaknessStacks = player.statuses.find(s => s.type === 'weakness')?.stacks ?? 0
  const actual = raw + weaknessStacks * 2
  const afterShield = Math.max(0, actual - player.shield)
  player.shield = Math.max(0, player.shield - actual)
  player.hp = Math.max(0, player.hp - afterShield)
  if (player.hp <= 0) player.isAlive = false
  return afterShield
}

function applyStatus(target: { statuses: StatusEffect[] }, status: StatusEffect) {
  const existing = target.statuses.find(s => s.type === status.type)
  if (existing) existing.stacks += status.stacks
  else target.statuses.push({ ...status })
}

function tickPoison(player: Player): number {
  const poison = player.statuses.find(s => s.type === 'poison')
  if (!poison) return 0
  const dmg = poison.stacks * 2
  player.hp = Math.max(0, player.hp - dmg)
  poison.stacks = Math.max(0, poison.stacks - 1)
  if (poison.stacks === 0) player.statuses = player.statuses.filter(s => s.type !== 'poison')
  if (player.hp <= 0) player.isAlive = false
  return dmg
}

function addLog(s: GameState, text: string, type: GameState['log'][0]['type'] = 'system') {
  s.log.push({ turn: s.turn, text, type })
}

// ── Sanitize: скрываем sharedDeck от клиента ─────────────────────────────────

function sanitizeForClient(game: GameState): GameState {
  const s = clone(game)
  const deckCount = s.sharedDeck.length
  for (const p of s.players) p.deckCount = deckCount
  s.sharedDeck = []
  s.sharedDiscardPile = []
  return s
}

// ── Инициализация мокового state c реальной sharedDeck ────────────────────────

function makeFreshState(playerName = 'Player'): GameState {
  const sharedDeck = shuffle(
    ALL_CARDS.map((c, i) => ({ ...c, id: `${c.baseId}_init_${i}` }))
  )
  const s: GameState = {
    ...clone(initialGameState),
    sharedDeck,
    sharedDiscardPile: [],
    players: [
      { ...clone(initialGameState.players[0]), name: playerName, hand: [] },
      { ...clone(initialGameState.players[1]), hand: [] },
    ],
  }
  // Раздаём стартовые карты из общей колоды
  drawFromShared(s, s.players[0], 3)
  drawFromShared(s, s.players[1], 3)
  return s
}

// ── main resolve ──────────────────────────────────────────────────────────────

function resolveFullTurn(s: GameState): GameState {
  const [p1, p2] = s.players
  const p1Cards = p1.hand.filter(c => (p1.selectedCardId as string[]).includes(c.id))
  const p2Cards = p2.hand.filter(c => (p2.selectedCardId as string[]).includes(c.id))

  s.phase = 'reveal'
  s.lastReveal = []

  for (const [player, cards] of [[p1, p1Cards], [p2, p2Cards]] as const) {
    let spent = 0
    for (const card of cards) {
      if (spent + card.cost > player.energy) continue
      spent += card.cost
      const reveal: NonNullable<GameState['lastReveal']>[0] = { playerId: player.id, card }

      if (card.type === 'attack') {
        const weakness = s.boss.statuses.find(st => st.type === 'weakness')?.stacks ?? 0
        const dmg = card.value + weakness * 2
        s.boss.hp = Math.max(0, s.boss.hp - dmg)
        reveal.damageDealt = dmg
        addLog(s, `${player.name} plays ${card.name} — ${dmg} dmg`, 'damage')
      }
      if (card.type === 'defense') {
        player.shield += card.value
        reveal.shieldGained = card.value
        addLog(s, `${player.name} gains ${card.value} shield`, 'system')
      }
      if (card.type === 'special' && card.statusEffect) {
        applyStatus(s.boss, card.statusEffect)
        reveal.statusApplied = card.statusEffect
        addLog(s, `${player.name} applies ${card.statusEffect.type}`, 'status')
      }
      s.lastReveal!.push(reveal)
    }
  }

  if (s.boss.hp <= 0) { s.phase = 'victory'; addLog(s, 'Victory!'); return s }

  // ── Boss turn ─────────────────────────────────────────────────────────────
  const action = s.boss.nextAction
  const targets = action.target === 'both' ? [p1, p2]
    : action.target === 'player-1' ? [p1] : [p2]

  if (action.kind === 'attack' || action.kind === 'attack_status') {
    for (const t of targets) {
      const dealt = applyDamage(t, action.damage ?? 0)
      addLog(s, `Boss hits ${t.name} for ${dealt}`, 'boss')
    }
  }
  if ((action.kind === 'status' || action.kind === 'attack_status') && action.status) {
    for (const t of targets) {
      applyStatus(t, action.status)
      addLog(s, `Boss applies ${action.status.type}`, 'status')
    }
  }

  for (const p of [p1, p2]) {
    const dmg = tickPoison(p)
    if (dmg) addLog(s, `${p.name} takes ${dmg} poison`, 'damage')
  }

  if (!p1.isAlive && !p2.isAlive) { s.phase = 'defeat'; addLog(s, 'Defeat'); return s }

  // ── Следующий ход ─────────────────────────────────────────────────────────
  s.turn += 1
  s.boss.nextAction = randomBossAction(s.boss.phase)
  if (s.boss.hp <= s.boss.maxHp * 0.5 && s.boss.phase === 1) {
    s.boss.phase = 2
    addLog(s, 'Phase 2!', 'boss')
  }

  for (const p of [p1, p2]) {
    // Сыгранные карты → общий сброс
    const played = p.selectedCardId as string[]
    for (const cid of played) {
      const idx = p.hand.findIndex(c => c.id === cid)
      if (idx !== -1) { s.sharedDiscardPile.push(p.hand[idx]); p.hand.splice(idx, 1) }
    }
    // Добор 1 карты из общей колоды
    drawFromShared(s, p, 1)

    p.selectedCardId = []
    p.submitted = false
    p.shield = 0
    p.energy = Math.min(s.turn, p.maxEnergy)
  }

  s.phase = 'action'
  s.turnDeadline = Date.now() + 20_000
  return s
}

// ── routes ────────────────────────────────────────────────────────────────────

export const handlers = [
  http.post('/api/rooms', async () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    return HttpResponse.json({ code })
  }),

  http.get('/api/game/:id', async () => {
    return HttpResponse.json(sanitizeForClient(state))
  }),

  http.post('/api/game/:id/action', async ({ request }) => {
    const body = await request.json() as { playerId: string; cardIds: string[] }
    const s = state
    const player = s.players.find(p => p.id === body.playerId)
    if (!player || player.submitted) {
      return HttpResponse.json(sanitizeForClient(clone(s)))
    }

    const validCardIds = (body.cardIds ?? []).filter(cid => player.hand.some(c => c.id === cid))
    const totalCost = validCardIds.reduce((sum, cid) => {
      return sum + (player.hand.find(c => c.id === cid)?.cost ?? 0)
    }, 0)
    if (totalCost > player.energy) {
      return HttpResponse.json({ error: 'Not enough energy' }, { status: 400 })
    }

    player.selectedCardId = validCardIds as unknown as string[]
    player.submitted = true

    // Бот ходит автоматически
    const ally = s.players.find(p => p.id !== body.playerId)!
    if (!ally.submitted) {
      const selected: string[] = []
      let energy = ally.energy
      for (const card of [...ally.hand].sort(() => Math.random() - 0.5)) {
        if (card.cost <= energy) { selected.push(card.id); energy -= card.cost }
      }
      ally.selectedCardId = selected as unknown as string[]
      ally.submitted = true
    }

    if (s.players.every(p => p.submitted)) {
      await delay(300)
      state = resolveFullTurn(clone(s))
    }

    return HttpResponse.json(sanitizeForClient(clone(state)))
  }),

  http.post('/api/game/:id/solo', async ({ request }) => {
    const body = await request.json() as { playerName?: string }
    state = makeFreshState(body?.playerName?.trim() || 'Player')
    state.isSolo = true
    return HttpResponse.json(sanitizeForClient(clone(state)))
  }),

  http.post('/api/game/:id/reset', async ({ request }) => {
    const body = await request.json() as { playerName?: string } | null
    state = makeFreshState(body?.playerName?.trim() || state.players[0].name)
    return HttpResponse.json(sanitizeForClient(clone(state)))
  }),
]
