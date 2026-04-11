# Task: Deck System — 50 Cards + Visual Stack Widget (per-player card back)

## Overview

Replace the current 8-template × 2-copy (16-card) deck with a shared deck of **50 unique numbered cards**.  
On the frontend — a **DeckStack widget** showing a face-down pile with a card counter.  
Каждый игрок видит стопку с **той рубашкой, которую выбрал сам** в главном меню.  
Стопка союзника отображается с **его рубашкой** (`allyCardBackId`).

---

## Контекст: как сейчас работает выбор рубашки

- Игрок выбирает рубашку в `features/select-card-back/CardBackPanel.tsx`
- Выбор сохраняется в `localStorage` через `saveSelectedCardBack(id)` (`entities/card/model/cardBack.ts`)
- При подключении к комнате клиент отправляет `cardBackId` в WS-сообщении `join`
- Сервер (`lobby.ws.ts`) сохраняет его в БД через `roomRepository.addPlayer(..., cardBack, ...)`
- При старте игры сервер шлёт каждому игроку: `{ type: 'ready', allyCardBackId: '...' }`
- При входе в комнату сервер шлёт: `{ type: 'joined', allyCardBackId: '...' }`

Таким образом, клиент знает:
- **свою рубашку** — из `localStorage` (`getSelectedCardBack()`)
- **рубашку союзника** — из WS-события `ready.allyCardBackId` / `joined.allyCardBackId`

---

## 1. `packages/game-engine/src/cards/cards.config.ts`

Replace `CARD_TEMPLATES` with exactly **50 unique entries**, set `CARDS_PER_TEMPLATE = 1`.

Each card gets a **number suffix in its `name`** for QA (`"Slash #1"`, `"Heavy Blow #2"` etc).  
`baseId` must also be unique per entry (`slash_01`, `slash_02`, …).

Approximate type distribution:
- ~18 attack
- ~12 defense
- ~10 support
- ~6 special
- ~4 hidden

Example:
```ts
export const CARD_TEMPLATES: Omit<Card, 'id'>[] = [
  { baseId: 'slash_01',   name: 'Slash #1',      type: 'attack',  value: 8,  cost: 1 },
  { baseId: 'slash_02',   name: 'Slash #2',      type: 'attack',  value: 8,  cost: 1 },
  { baseId: 'heavy_03',   name: 'Heavy Blow #3', type: 'attack',  value: 14, cost: 2 },
  // ... до #50
]

export const CARDS_PER_TEMPLATE = 1
```

**`gameLogic.ts` не трогать** — `makeSharedDeck()` и сплит пополам уже работают корректно.

---

## 2. Frontend — `DeckStack` Widget

### FSD-расположение

```
apps/client/src/
  widgets/
    deck-stack/
      index.ts
      ui/
        DeckStack.tsx
        DeckStack.module.css
```

### Props

```ts
interface DeckStackProps {
  count: number          // player.deck.length
  cardBackId: CardBackId // рубашка этого игрока
}
```

### Откуда брать `cardBackId`

**Для своей стопки:**
```ts
import { getSelectedCardBack } from '@/entities/card/model/cardBack'
const myCardBackId = getSelectedCardBack() // из localStorage
```

**Для стопки союзника:**  
`allyCardBackId` приходит в WS-событиях `joined` и `ready` — должен быть сохранён в Redux store (или локальный state страницы игры).

Убедиться, что Redux slice для игры (`gameSlice` или аналог) хранит `allyCardBackId: CardBackId`.  
Если не хранит — добавить поле и заполнять при обработке `joined`/`ready` событий.

### Visual

Несколько абсолютно позиционированных карточек-рубашек со смещением — имитация стопки:

```tsx
const LAYERS = 4
const CardBackComp = CARD_BACK_COMPONENTS[cardBackId]

<div className={styles.stack}>
  {Array.from({ length: Math.min(LAYERS, count) }).map((_, i) => (
    <div
      key={i}
      className={styles.layer}
      style={{ top: i * 2, left: i * 2, zIndex: LAYERS - i }}
    >
      <CardBackComp />
    </div>
  ))}
  <span className={styles.counter}>{count}</span>
</div>
```

Когда `count === 0` — показывать пустое место или dim-состояние (не скрывать, чтобы UI не прыгал).

---

## 3. Размещение в игровом поле

Согласно схеме из `CLAUDE.md`:
```
last actions | BOSS  | info
ARENA        | ARENA | ARENA
ARENA        | ARENA | deck   <── сюда
ARENA        | ARENA | ARENA
```

В ячейке `deck` размещать **два виджета** — свою стопку и стопку союзника:

```tsx
// Своя колода
<DeckStack count={me.deck.length} cardBackId={myCardBackId} />

// Колода союзника (count берётся из gameState союзника)
<DeckStack count={ally.deck.length} cardBackId={allyCardBackId} />
```

---

## 4. WebSocket / State

Сервер уже передаёт `allyCardBackId` в событиях `joined` и `ready` — это готово.

**Важно:** сервер не должен слать содержимое `deck` чужого игрока клиенту.  
Проверить `lobby.ws.ts` — при сериализации `GameState` заменять `otherPlayer.deck` на `[]`  
(достаточно передавать `deckCount: number` или просто длину, не сами карты).

---

## 5. Acceptance Criteria

- [ ] `CARD_TEMPLATES` содержит ровно **50 записей**, `CARDS_PER_TEMPLATE = 1`
- [ ] Каждое `name` содержит уникальный номер `#1`–`#50`
- [ ] `DeckStack` отображается на поле в ячейке `deck`
- [ ] Стопка игрока отображается с **его рубашкой** (из `localStorage`)
- [ ] Стопка союзника отображается с **рубашкой союзника** (из `allyCardBackId` в store)
- [ ] Число на стопке совпадает с реальным `deck.length`
- [ ] При `deck.length === 0` стопка показывает пустое/dim состояние
- [ ] Карты колоды соперника не передаются клиенту в WS-пакете (только длина)

---

## Out of Scope

- Анимация вытягивания карты из стопки — отдельная задача
- Выбор рубашки для стопки союзника (он видит только свою рубашку на своей стопке) — уже решено
