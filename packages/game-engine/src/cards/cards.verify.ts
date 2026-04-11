/**
 * Быстрая проверка Acceptance Criteria из TASK-deck-system.md
 * Запускается: npx ts-node src/cards/cards.verify.ts (из packages/game-engine)
 */
import { CARD_TEMPLATES, CARDS_PER_TEMPLATE } from './cards.config'
import { PLAYER_DEFAULTS } from '@veil/shared'

const totalCards       = CARD_TEMPLATES.length * CARDS_PER_TEMPLATE
const startCardsTotal  = PLAYER_DEFAULTS.startCards * 2   // 3 × 2 игрока = 6
const sharedDeckAfter  = totalCards - startCardsTotal      // 50 - 6 = 44

const baseIds  = CARD_TEMPLATES.map(t => t.baseId)
const names    = CARD_TEMPLATES.map(t => t.name)
const uniqueBaseIds = new Set(baseIds)
const uniqueNames   = new Set(names)

// ── проверки ──────────────────────────────────────────────────────────────────

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`)
  console.log(`  ✓  ${msg}`)
}

console.log('\n── Deck system: Acceptance Criteria ────────────────────────────')

assert(CARDS_PER_TEMPLATE === 1,         'CARDS_PER_TEMPLATE === 1')
assert(CARD_TEMPLATES.length === 50,     'CARD_TEMPLATES содержит ровно 50 записей')
assert(uniqueBaseIds.size === 50,        'Все baseId уникальны')
assert(uniqueNames.size  === 50,        'Все name уникальны')

// Каждый name должен содержать #N
const allHaveNumber = CARD_TEMPLATES.every(t => /#\d+/.test(t.name))
assert(allHaveNumber,                   'Каждый name содержит уникальный #N')

assert(totalCards === 50,               `Общая колода = ${totalCards} карт`)
assert(sharedDeckAfter === 44,          `sharedDeck после старта = ${sharedDeckAfter} (ожидалось 44)`)

// Проверяем распределение типов
const byType = CARD_TEMPLATES.reduce((acc, t) => {
  acc[t.type] = (acc[t.type] ?? 0) + 1
  return acc
}, {} as Record<string, number>)

console.log('\n── Распределение типов:')
for (const [type, count] of Object.entries(byType)) {
  console.log(`     ${type.padEnd(8)} : ${count}`)
}

console.log('\n── Все проверки пройдены ✓\n')
