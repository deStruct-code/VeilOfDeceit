import { http, HttpResponse, delay } from 'msw'
import type {GameState, Player, StatusEffect} from "@veil/shared";
import { initialGameState, drawHand, randomBossAction } from './game.mock'

// Deep clone helper
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x))

let state: GameState = clone(initialGameState)

// ── helpers ──────────────────────────────────────────────────────────────────

function applyDamage(player: Player, raw: number): number {
  const weaknessStacks = player.statuses.find(s => s.type === 'weakness')?.stacks ?? 0
  const actual = raw + weaknessStacks * 2  // weakness increases damage taken
  const afterShield = Math.max(0, actual - player.shield)
  player.shield = Math.max(0, player.shield - actual)
  player.hp = Math.max(0, player.hp - afterShield)
  return afterShield
}

function applyStatus(player: Player, status: StatusEffect) {
  const existing = player.statuses.find(s => s.type === status.type)
  if (existing) existing.stacks += status.stacks
  else player.statuses.push({ ...status })
}

function tickPoison(player: Player): number {
  const poison = player.statuses.find(s => s.type === 'poison')
  if (!poison) return 0
  const dmg = poison.stacks * 2
  player.hp = Math.max(0, player.hp - dmg)
  poison.stacks = Math.max(0, poison.stacks - 1)
  if (poison.stacks === 0) player.statuses = player.statuses.filter(s => s.type !== 'poison')
  return dmg
}

function checkDefeat(s: GameState): boolean {
  return s.players.some(p => p.hp <= 0)
}

function checkVictory(s: GameState): boolean {
  return s.boss.hp <= 0
}

function addLog(s: GameState, text: string, type: GameState['log'][0]['type'] = 'system') {
  s.log.push({ turn: s.turn, text, type })
}

// ── main resolve ─────────────────────────────────────────────────────────────

function resolveFullTurn(s: GameState): GameState {
  const [p1, p2] = s.players
  const p1Card = p1.hand.find(c => c.id === p1.selectedCardId)
  const p2Card = p2.hand.find(c => c.id === p2.selectedCardId)

  s.phase = 'reveal'
  s.lastReveal = []

  // ── player cards resolve ──
  for (const [player, card, other] of [[p1, p1Card, p2], [p2, p2Card, p1]] as const) {
    if (!card) continue
    const reveal: NonNullable<GameState['lastReveal']>[0] = { playerId: player.id, card }

    if (card.type === 'attack') {
      const weakness = s.boss.statuses?.find((st: StatusEffect) => st.type === 'weakness')
      const bonus = weakness ? weakness.stacks * 2 : 0
      const dmg = card.value + bonus
      s.boss.hp = Math.max(0, s.boss.hp - dmg)
      reveal.damageDealt = dmg
      addLog(s, `${player.name} plays ${card.name} — ${dmg} dmg to boss.`, 'damage')
    }

    if (card.type === 'defense') {
      player.shield = (player.shield ?? 0) + card.value
      reveal.shieldGained = card.value
      addLog(s, `${player.name} plays ${card.name} — +${card.value} shield.`, 'system')
    }

    if (card.type === 'support') {
      // Empower: give ally bonus (stored temporarily)
      ;(other as any)._empowerBonus = ((other as any)._empowerBonus ?? 0) + 4
      addLog(s, `${player.name} plays ${card.name} — ally empowered.`, 'system')
    }

    if (card.type === 'special' && card.statusEffect) {
      if (!s.boss.statuses) s.boss.statuses = []
      const existing = (s.boss.statuses as StatusEffect[]).find(st => st.type === card.statusEffect!.type)
      if (existing) existing.stacks += card.statusEffect.stacks
      else (s.boss.statuses as StatusEffect[]).push({ ...card.statusEffect })
      reveal.statusApplied = card.statusEffect
      addLog(s, `${player.name} plays ${card.name} — boss: ${card.statusEffect.type} ×${card.statusEffect.stacks}.`, 'status')
    }

    s.lastReveal!.push(reveal)
  }

  // clear empower
  ;(p1 as any)._empowerBonus = 0
  ;(p2 as any)._empowerBonus = 0

  if (checkVictory(s)) {
    s.phase = 'victory'
    addLog(s, 'The Hollow Lich crumbles to dust. Victory!', 'system')
    return s
  }

  // ── boss phase ──
  s.phase = 'boss_attack'
  const action = s.boss.nextAction

  if (action.type === 'attack' || action.type === 'attack_status') {
    const targets = action.target === 'both' ? [p1, p2]
      : action.target === 'player-1' ? [p1] : [p2]
    for (const t of targets) {
      const dealt = applyDamage(t, action.damage ?? 0)
      addLog(s, `Lich uses ${action.label} — ${dealt} dmg to ${t.name}.`, 'boss')
    }
  }

  if ((action.type === 'status' || action.type === 'attack_status') && action.status) {
    const targets = action.target === 'both' ? [p1, p2]
      : action.target === 'player-1' ? [p1] : [p2]
    for (const t of targets) {
      applyStatus(t, action.status)
      addLog(s, `Lich inflicts ${action.status.type} ×${action.status.stacks} on ${t.name}.`, 'status')
    }
  }

  // ── tick poison on players ──
  for (const p of [p1, p2]) {
    const dmg = tickPoison(p)
    if (dmg > 0) addLog(s, `${p.name} takes ${dmg} poison damage.`, 'damage')
  }


  if (checkDefeat(s)) {
    s.phase = 'defeat'
    addLog(s, 'Both heroes have fallen. Darkness wins.', 'system')
    return s
  }

  // ── next turn setup ──
  s.phase = 'new_cards'
  s.turn += 1

  // boss phase escalation at 50% hp
  if (s.boss.hp <= s.boss.maxHp * 0.5 && s.boss.phase === 1) {
    s.boss.phase = 2
    addLog(s, 'The Lich enters Phase 2 — its power surges!', 'system')
  }

  s.boss.nextAction = randomBossAction(s.boss.phase)

  for (const p of [p1, p2]) {
    p.hand = drawHand(p.id === 'player-1' ? 5 : 3)
    p.selectedCardId = null
    p.submitted = false
    p.energy = p.maxEnergy
    p.shield = 0
  }

  s.phase = 'action'
  return s
}

// ── routes ───────────────────────────────────────────────────────────────────

export const handlers = [
  http.get('/api/game/:id', async () => {
    return HttpResponse.json(clone(state))
  }),

  http.post('/api/game/:id/action', async ({ request }) => {
    const body = await request.json() as { playerId: string; cardId: string }
    const s = state
    const player = s.players.find(p => p.id === body.playerId)
    if (!player || player.submitted) return HttpResponse.json(clone(s))

    player.selectedCardId = body.cardId
    player.submitted = true

    // If both submitted — resolve full turn
    if (s.players.every(p => p.submitted)) {
      await delay(600)
      state = resolveFullTurn(clone(s))
    } else {
      // Ally AI: pick random card after short delay
      const ally = s.players.find(p => p.id !== body.playerId)!
      if (!ally.submitted && ally.hand.length > 0) {
        setTimeout(() => {
          const randomCard = ally.hand[Math.floor(Math.random() * ally.hand.length)]
          ally.selectedCardId = randomCard.id
          ally.submitted = true
          if (state.players.every(p => p.submitted)) {
            state = resolveFullTurn(clone(state))
          }
        }, 1200 + Math.random() * 1000)
      }
    }

    return HttpResponse.json(clone(state))
  }),

  http.post('/api/game/reset', async () => {
    state = clone(initialGameState)
    return HttpResponse.json(clone(state))
  }),
]
