
>This file is read by Claude Code at the start of every session
>DO NOT DELETE OR RENAME THIS FILE
>Отвечай на русском
>Always use colors from theme
>Always use FSD-stucture to creating files/pholders
>SOLID, DRY, KISS code style

-----TODO-----
[x] Create a folders using a chapter INFRASTRUCTURE
[x] Create a MVP with a mocks
[x] Deploy on a railway. Analyze all .json files to find a incompability 
[x] Make a CORS politic https://veilofdeceit-production.up.railway.app/ port 8000
[x] Use a "https://veilofdeceit-production.up.railway.app/" link fill a .env files and make this app is acceptable by this link
[x] Create a DB for games 
[x] Create a fields with names for players
[x] Fix a build. Now its counting energy and player can play as many cards as possible. Need to follow the rule: you can play cards if the cost of its energy cost of current turn allows it.
[x] Fix alias '@veil/shared/'
[x] Create a customazible battleground, I wanna create an arena assets by myself. The schema of battleground is 
last actions | BOSS | info
ARENA | ARENA | ARENA 
ARENA | ARENA | deck
ARENA | ARENA | ARENA
Nickname HP | ALly`s nickname HP
Energy      | Ally`s enegry
Hands       | Ally`s hands
[x] Fix bug. If Player has a 2cost cards on a first turn, he can`t do nothing. Make a button option 'Skip' in every turn.
[x] Create a timer. 20 sec for a turn. If player choose nothing so 'Skip' button is playing.
[x] Fix bug: When hp of player is 0 he still can play.
[x] Create a bot, who can play a random cards from his hand. Make a button in loby "Одиночная игра". 
[x] Fix a styles: The asset of background should be on a whole screen. So all cards and Boss picture will be to z-index ABOVE the background. Now background is cropped in the midddle of arena and there are a lot of information about everything. 
Size of a bg wil be 1024x1024. 
[x] Make a google-auth, so player can log into account and save his "progress". "Progress" now is anavailable.
[x] Create a npm run dev:server script, which will be a pull a variables from infra/env/dev.env because now he only use a second arg of || construction in env.ts SEVERENITY: HIGH. 
[x] Make a 6digits code generation from server. Now everyone can type any code and share it with friend. It is not what I want to. SEVERENITY: HIGH
[x] Make a "Share" button while waiting a second player. Link will be a full from search line.
[] Make SQL
[] Make a GamePage mobile-first! So need to rotate mobile to play this game.


-----INFO-----

1. General Information
Name: Veil of Deceit
Genre: Dark Fantasy / Card Game / Co-op / Bluff
Platforms: web app
Players: 1/2
Session Duration: (2-3 min)
Target Audience: (Card Games fans)

2. High Concept

A two-player cooperative card game where players fight a boss together while hiding their hands and deceiving each other. Trust is optional. Survival is not.

3. Core Gameplay Loop
Players draw cards
Players choose actions secretly
Actions are revealed and resolved
Boss performs action
Apply effects (damage, status, etc.)
Repeat until:
    Boss is defeated (hp = 0) or
    All players are defeated (hp = 0)

4. Core Mechanics
Hidden hands
Shared objective (defeat boss)
Conflicting incentives (to define)
Resource management (Cards are limited and their number is fixed)
Turn-based system

6. Card System
6.1 Card Types
Attack
Defense
Support
Special
(extend)
6.2 Card Attributes
Name
Type
Value / Power
Effect
Cost
Hidden / visible conditions

7. Boss System
7.1 Boss Properties
Health
Phases
Attack patterns
Passive abilities
7.2 Boss Behavior
Deterministic / semi-random
Phase transitions
Reaction to player actions (optional)

8. Resources
Health (HP)
Energy / Mana
Shared resources (if any)
Hidden resources

9. Bluff & Deception Systems
Hidden cards
Misinformation between players
Risk / reward for lying
Punishment mechanics (to define)

10. Win / Lose Conditions
Win:
Boss HP reaches 0
Lose:
Players die
Critical failure condition (to define)

11. Progression System (Optional)
Unlock new cards
Unlock bosses
Difficulty scaling
Meta progression

12. Game Modes (Future)
Ranked
Endless
Challenge mode

13. UI / UX Notes
Minimal UI
Focus on tension and hidden information
Clear feedback after reveal phase

14. Technical Notes
Frontend: (React, etc.)
Backend: (to define)
Real-time: WebSocket / polling
State management: (to define)

15. Monetization (Optional)
Cosmetic cards
Skins / themes
Battle pass (optional)

16. Roadmap
MVP +
Core loop + 
Basic cards +
1 boss + 
2 players +
Post-MVP + 
More cards
More bosses
Balance

17. Open Questions
How strong should bluffing be? 
It would 
Can players fully betray each other? 
No.
Is there hidden role system?
Currently no
How to prevent toxic gameplay?
There is no chat or something. So now you can play only with person, who paste your link

18. Notes / Ideas
(free space for anything)

-----INFRASTRUCTURE-----

veil-of-deceit/
│
├── apps/
│   ├── client/          # React (игра)
│   └── server/          # Node.js backend
│
├── packages/
│   ├── shared/          # общие типы, модели
│   └── game-engine/     # чистая логика игры (ВАЖНО)
│
├── infra/               # деплой, env, configs
│
├── package.json
├── tsconfig.base.json
├── README.md
└── Claude.md
└── railway.json

apps/client/src/
│
├── app/
│   ├── providers/
│   ├── store/
│   ├── router/
│   └── index.tsx
│
├── pages/
│   ├── lobby/
│   └── game/
│
├── widgets/
│   ├── game-board/
│   ├── player-hand/
│   ├── boss-panel/
│   └── turn-timer/
│
├── features/
│   ├── join-game/
│   ├── play-card/
│   └── submit-action/
│
├── entities/
│   ├── player/
│   ├── game/
│   ├── card/
│   └── boss/
│
├── shared/
│   ├── api/
│   │   ├── baseApi.ts      # RTK Query base
│   │   └── gameApi.ts
│   │
│   ├── lib/
│   ├── config/
│   └── ui/
│
└── mocks/                 # 🔥 важно для старта
    ├── game.mock.ts
    └── handlers.ts

apps/server/src/
│
├── main.ts
│
├── config/
│   ├── env.ts
│   └── db.ts
│
├── modules/
│   ├── game/
│   │   ├── game.controller.ts
│   │   ├── game.service.ts
│   │   ├── game.repository.ts
│   │   └── game.types.ts
│   │
│   ├── turn/
│   │   ├── turn.controller.ts
│   │   ├── turn.service.ts
│   │   └── turn.repository.ts
│   │
│   └── player/
│       ├── player.service.ts
│       └── player.repository.ts
│
├── game-engine/  # прокси к пакету (или прямой импорт)
│
├── db/
│   ├── migrations/
│   └── schema.sql
│
├── shared/
│   ├── middleware/
│   └── utils/
│
└── mocks/   # 🔥 можно мокать API

packages/game-engine/src/
│
├── core/
│   ├── resolveTurn.ts
│   ├── applyBoss.ts
│   └── applyEffects.ts
│
├── combo/
│   └── comboResolver.ts
│
├── cards/
│   └── cards.config.ts
│
├── types/
│   └── index.ts
│
└── index.ts

packages/shared/src/
│
├── types/
│   ├── game.ts
│   ├── turn.ts
│   ├── player.ts
│   └── api.ts
│
└── index.ts

infra/
│
├── docker/
│   └── Dockerfile
└── env/
    ├── dev.env
    └── prod.env

🔄 Связь слоёв
React → API → Controller → Service → Game Engine → DB

---STYLE---
# Veil of Deceit - Цветовая палитра дарк-фэнтези

## 🎨 Основные цвета

### Фоновые цвета
- **Deep Background**: `#090910` - Глубокий тёмно-синий, основной фон
- **Card Gradient**: 
  - От: `rgba(18, 12, 28, 0.97)` - Тёмно-фиолетовый
  - До: `rgba(12, 8, 20, 0.99)` - Очень тёмный фиолетовый
- **Input Background**: `rgba(10, 6, 20, 0.9)` - Почти чёрный с фиолетовым оттенком

### Золотые акценты (Gold/Amber)
Используются для основных элементов интерфейса, никнейма игрока:
- **Primary**: `#e8c97a` - Яркий золотой
- **Text**: `#d4b878` - Приглушённый золотой для текста
- **Muted**: `rgba(180, 130, 60, 0.6)` - Полупрозрачный золотой
- **Border**: `rgba(180, 130, 60, 0.22)` - Тонкая золотая граница
- **Hover**: `rgba(220, 170, 70, 0.6)` - Яркий золотой при наведении

### Фиолетовые акценты (Purple/Violet)
Используются для многопользовательских элементов, кода приглашения:
- **Primary**: `#d4a8ff` - Яркий фиолетовый
- **Text**: `#c09ee0` - Приглушённый фиолетовый для текста
- **Muted**: `#a07bc8` - Более тёмный фиолетовый
- **Border**: `rgba(120, 70, 180, 0.3)` - Фиолетовая граница
- **Hover**: `rgba(160, 100, 220, 0.6)` - Фиолетовый при наведении
- **Label**: `rgba(140, 90, 200, 0.65)` - Цвет для меток

## 🎮 Кнопки

### Кнопка "Играть соло" (Золотая)
```css
/* Обычное состояние */
background: linear-gradient(135deg, 
  rgba(100, 60, 10, 0.7) 0%, 
  rgba(70, 35, 5, 0.85) 50%, 
  rgba(90, 50, 8, 0.75) 100%);
color: #c9a85c;
border: 1px solid rgba(180, 130, 60, 0.35);

/* При наведении */
background: linear-gradient(135deg, 
  rgba(140, 90, 20, 0.9) 0%, 
  rgba(100, 55, 10, 0.95) 50%, 
  rgba(120, 70, 15, 0.9) 100%);
color: #f5dc8a;
border: 1px solid rgba(220, 170, 70, 0.6);
```

### Кнопка "Играть вдвоём" (Фиолетовая)
```css
/* Обычное состояние */
background: linear-gradient(135deg, 
  rgba(30, 12, 60, 0.7) 0%, 
  rgba(18, 6, 40, 0.85) 50%, 
  rgba(25, 10, 50, 0.75) 100%);
color: #a07bc8;
border: 1px solid rgba(120, 70, 180, 0.3);

/* При наведении */
background: linear-gradient(135deg, 
  rgba(50, 20, 90, 0.95) 0%, 
  rgba(30, 10, 65, 0.98) 50%, 
  rgba(45, 18, 80, 0.95) 100%);
color: #d4a8ff;
border: 1px solid rgba(160, 100, 220, 0.6);
```

## ✨ Атмосферные эффекты

### Свечения
- **Top Glow** (верхнее фиолетовое): `rgba(120, 50, 180, 0.6)`
- **Bottom Ember** (нижний огненный): `rgba(180, 60, 20, 0.7)`

### Тени карточки
```css
box-shadow: 
  0 0 60px rgba(100, 40, 160, 0.12),    /* Фиолетовое свечение */
  0 0 120px rgba(0, 0, 0, 0.8),         /* Глубокая тень */
  inset 0 1px 0 rgba(180, 130, 60, 0.08); /* Внутренний золотой блик */
```

## 📝 Типографика

### Шрифты
- **Cinzel**: Основной шрифт для кнопок и инпутов
- **Cinzel Decorative**: Декоративный шрифт для заголовка "VEIL OF DECEIT"
- **IM Fell English**: Курсивный шрифт для подзаголовков и подсказок

### Руны
Unicode руны в футере: `ᚠ ᚢ ᚦ ᚨ ᚱ`

## 🔧 CSS переменные

Все цвета доступны через CSS переменные в `/src/styles/theme.css`:

```css
var(--veilofdeceit-bg-deep)
var(--veilofdeceit-gold-primary)
var(--veilofdeceit-purple-primary)
var(--veilofdeceit-btn-solo-bg)
var(--veilofdeceit-btn-duo-bg)
/* и другие... */
```
