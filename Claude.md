
>This file is read by Claude Code at the start of every session
>DO NOT DELETE OR RENAME THIS FILE
>Отвечай на русском

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
[] Fix bug. If Player has a 2cost cards on a first turn, he can`t do nothing. Make a button option 'Skip' in every turn.
[] Create a timer. 20 sec for a turn. If player choose nothing so 'Skip' button is playing.
[] Fix bug: When hp of player is 0 he still can play. Need to just 
[] Create a bot, who can play a random cards from his hand. Make a button in loby "Одиночная игра". 
[] Make a google-auth, so player can log into account and save his "progress". "Progress" now is anavailable.
[] Cut-scene, when the game is started it must be a 10second untill cards are given and information about hp and energy are shown. 
-----INFO-----

1. General Information
Name: Veil of Deceit
Genre: Dark Fantasy / Card Game / Co-op / Bluff
Platforms: web app
Players: 1/2
Session Duration: (1-3 min)
Target Audience: (to define)

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
MVP
Core loop
Basic cards
1 boss
2 players
Post-MVP
More cards
More bosses
Balance

17. Open Questions
How strong should bluffing be?
Can players fully betray each other?
Is there hidden role system?
How to prevent toxic gameplay?

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

