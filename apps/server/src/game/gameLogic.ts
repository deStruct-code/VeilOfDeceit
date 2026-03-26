import type { Card, GameState, Player, StatusEffect } from '@veil/shared'
import { PLAYER_DEFAULTS } from '@veil/shared'

// ─── Карты-шаблоны ────────────────────────────────────────────────────────────
// baseId — стабильный идентификатор шаблона
// id будет переопределён при создании экземпляра в drawCards()

export const CARD_TEMPLATES: Omit<Card, 'id'>[] = [
  { baseId: 'slash',       name: 'Slash',       type: 'attack',  value: 8,  cost: 1 },
  { baseId: 'heavy',       name: 'Heavy Blow',  type: 'attack',  value: 14, cost: 2 },
  { baseId: 'bleed',       name: 'Bleed',       type: 'attack',  value: 5,  cost: 1, effect: 'Poison ×2',           statusEffect: { type: 'poison',   stacks: 2 } },
  { baseId: 'parry',       name: 'Parry',       type: 'defense', value: 6,  cost: 1 },
  { baseId: 'shield_wall', name: 'Shield Wall', type: 'defense', value: 12, cost: 2 },
  { baseId: 'empower',     name: 'Empower',     type: 'support', value: 0,  cost: 1, effect: 'Ally +4 dmg next card' },
  { baseId: 'weaken',      name: 'Weaken',      type: 'special', value: 0,  cost: 1, effect: 'Boss: Weakness ×2',   statusEffect: { type: 'weakness', stacks: 2 } },
  { baseId: 'surge',       name: 'Surge',       type: 'attack',  value: 6,  cost: 0, effect: 'Free card' },
]

// ─── Создание стартовой колоды ────────────────────────────────────────────────

function makeDeck(): Card[] {
  // Берём все шаблоны по 2 копии — получается колода из 16 карт
  const cards: Card[] = []
  for (const tpl of CARD_TEMPLATES) {
    for (let copy = 0; copy < 2; copy++) {
      cards.push({
        ...tpl,
        id: `${tpl.baseId}_${copy}`,
      })
    }
  }
  return shuffle(cards)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Тянем карты из колоды ────────────────────────────────────────────────────
// Если колода кончилась — перемешиваем сброс обратно

function drawCards(player: Player, count: number): void {
  for (let i = 0; i < count; i++) {
    if (player.hand.length >= player.handLimit) break

    // Колода пуста — перемешиваем сброс
    if (player.deck.length === 0) {
      if (player.discardPile.length === 0) break  // и сброс пуст — карт нет
      player.deck = shuffle(player.discardPile)
      player.discardPile = []
    }

    const card = player.deck.pop()!
    // Даём уникальный id экземпляру чтобы React key и selectedCardId работали
    player.hand.push({ ...card, id: `${card.baseId}_${Date.now()}_${i}` })
  }
}

// ─── Сбрасываем руку в дискард ────────────────────────────────────────────────

function discardHand(player: Player): void {
  player.discardPile.push(...player.hand)
  player.hand = []
}

// ─── Энергия по ходу ─────────────────────────────────────────────────────────

function energyForTurn(turn: number, maxEnergy: number): number {
  return Math.min(turn, maxEnergy)
}

// ─── Boss action pool ─────────────────────────────────────────────────────────

export const BOSS_ACTION_POOL: GameState['boss']['nextAction'][] = [
  { type: 'attack',        label: 'Soul Drain',    damage: 12, target: 'both' },
  { type: 'attack',        label: 'Bone Crush',    damage: 18, target: 'player-1' },
  { type: 'attack',        label: 'Dark Lash',     damage: 15, target: 'player-2' },
  { type: 'status',        label: 'Curse of Rot',  status: { type: 'poison',   stacks: 3 }, target: 'both' },
  { type: 'status',        label: 'Enfeeble',      status: { type: 'weakness', stacks: 2 }, target: 'player-1' },
  { type: 'attack_status', label: 'Necrotic Bite', damage: 8, status: { type: 'poison', stacks: 2 }, target: 'player-2' },
]

export function randomBossAction(phase: number): GameState['boss']['nextAction'] {
  const pool = phase >= 2
    ? BOSS_ACTION_POOL
    : BOSS_ACTION_POOL.filter(a => a.type === 'attack')
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────

export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

function addLog(s: GameState, text: string, type: GameState['log'][0]['type'] = 'system') {
  s.log.push({ turn: s.turn, text, type })
}

// ─── Урон игроку ─────────────────────────────────────────────────────────────

function applyDamage(player: Player, raw: number): number {
  const weaknessStacks = player.statuses.find(s => s.type === 'weakness')?.stacks ?? 0
  const actual = raw + weaknessStacks * 2
  const afterShield = Math.max(0, actual - player.shield)
  player.shield = Math.max(0, player.shield - actual)
  player.hp = Math.max(0, player.hp - afterShield)
  if (player.hp <= 0) player.isAlive = false
  return afterShield
}

// ─── Статусы ─────────────────────────────────────────────────────────────────

function applyStatus(player: Player, status: StatusEffect) {
  const existing = player.statuses.find(s => s.type === status.type)
  if (existing) {
    existing.stacks += status.stacks
  } else {
    player.statuses.push({ ...status })
  }
}

function tickPoison(player: Player): number {
  const poison = player.statuses.find(s => s.type === 'poison')
  if (!poison) return 0
  const dmg = poison.stacks * 2
  player.hp = Math.max(0, player.hp - dmg)
  if (player.hp <= 0) player.isAlive = false
  poison.stacks = Math.max(0, poison.stacks - 1)
  if (poison.stacks === 0) player.statuses = player.statuses.filter(s => s.type !== 'poison')
  return dmg
}

// ─── Win/lose ─────────────────────────────────────────────────────────────────

function checkDefeat(s: GameState): boolean {
  return s.players.every(p => !p.isAlive)
}

function checkVictory(s: GameState): boolean {
  return s.boss.hp <= 0
}

// ─── Создание начального состояния ───────────────────────────────────────────

function makePlayer(
  id: 'player-1' | 'player-2',
  name: string,
): Player {
  const deck = makeDeck()
  const player: Player = {
    id,
    name,
    hp:           PLAYER_DEFAULTS.maxHp,
    maxHp:        PLAYER_DEFAULTS.maxHp,
    shield:       0,
    energy:       1,   // первый ход — 1 энергия
    maxEnergy:    PLAYER_DEFAULTS.maxEnergy,
    hand:         [],
    handLimit:    PLAYER_DEFAULTS.handLimit,
    deck,
    discardPile:  [],
    statuses:     [],
    selectedCardId: null,
    submitted:    false,
    isAlive:      true,
  }
  // Тянем стартовые карты
  drawCards(player, PLAYER_DEFAULTS.startCards)
  return player
}

export function createInitialGameState(
  gameId: string,
  name1 = 'Player 1',
  name2 = 'Player 2',
): GameState {
  return {
    id:    gameId,
    phase: 'action',
    turn:  1,
    boss: {
      id:      'lich',
      name:    'The Hollow Lich',
      hp:      800,
      maxHp:   800,
      phase:   1,
      statuses: [],
      nextAction: { type: 'attack', label: 'Soul Drain', damage: 12, target: 'both' },
    },
    players: [
      makePlayer('player-1', name1),
      makePlayer('player-2', name2),
    ],
    log: [
      { turn: 0, text: 'The Hollow Lich awakens. Darkness falls.', type: 'system' },
    ],
  }
}

// ─── Разрешение хода ─────────────────────────────────────────────────────────

export function resolveFullTurn(s: GameState): GameState {
  const [p1, p2] = s.players
  const p1Card = p1.hand.find(c => c.id === p1.selectedCardId)
  const p2Card = p2.hand.find(c => c.id === p2.selectedCardId)

  s.phase = 'reveal'
  s.lastReveal = []

  // ── Применяем карты игроков ──
  for (const [player, card, other] of [[p1, p1Card, p2], [p2, p2Card, p1]] as [Player, Card | undefined, Player][]) {
    if (!card) continue
    const reveal: NonNullable<GameState['lastReveal']>[0] = { playerId: player.id, card }

    if (card.type === 'attack') {
      const weakness = s.boss.statuses.find(st => st.type === 'weakness')
      const bonus = weakness ? weakness.stacks * 2 : 0
      const dmg = card.value + bonus + ((player as any)._empowerBonus ?? 0)
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
      ;(other as any)._empowerBonus = ((other as any)._empowerBonus ?? 0) + 4
      addLog(s, `${player.name} plays ${card.name} — ally empowered.`, 'system')
    }

    if (card.type === 'special' && card.statusEffect) {
      const existing = s.boss.statuses.find(st => st.type === card.statusEffect!.type)
      if (existing) existing.stacks += card.statusEffect.stacks
      else s.boss.statuses.push({ ...card.statusEffect })
      reveal.statusApplied = card.statusEffect
      addLog(s, `${player.name} plays ${card.name} — boss: ${card.statusEffect.type} ×${card.statusEffect.stacks}.`, 'status')
    }

    s.lastReveal!.push(reveal)
  }

  ;(p1 as any)._empowerBonus = 0
  ;(p2 as any)._empowerBonus = 0

  // ── Проверяем победу ──
  if (checkVictory(s)) {
    s.phase = 'victory'
    addLog(s, 'The Hollow Lich crumbles to dust. Victory!', 'system')
    return s
  }

  // ── Атака босса ──
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

  // ── Тик яда ──
  for (const p of [p1, p2]) {
    const dmg = tickPoison(p)
    if (dmg > 0) addLog(s, `${p.name} takes ${dmg} poison damage.`, 'damage')
  }

  // ── Проверяем поражение ──
  if (checkDefeat(s)) {
    s.phase = 'defeat'
    addLog(s, 'Both heroes have fallen. Darkness wins.', 'system')
    return s
  }

  // ── Переход к новому ходу ──
  s.phase = 'new_cards'
  s.turn += 1

  // Фаза 2 босса при 50% HP
  if (s.boss.hp <= s.boss.maxHp * 0.5 && s.boss.phase === 1) {
    s.boss.phase = 2
    addLog(s, 'The Lich enters Phase 2 — its power surges!', 'system')
  }

  s.boss.nextAction = randomBossAction(s.boss.phase)

  // ── Сброс руки, раздача новых карт ──
  for (const p of [p1, p2]) {
    discardHand(p)
    drawCards(p, p.handLimit)
    p.selectedCardId = null
    p.submitted = false
    p.shield = 0
    p.energy = energyForTurn(s.turn, p.maxEnergy)
  }

  s.phase = 'action'
  return s
}