
>This file is read by Claude Code at the start of every session
>DO NOT DELETE OR RENAME THIS FILE
>Отвечай на русском

-----TODO-----
[x] Create a folders using a chapter INFRASTRUCTURE
[] 
[]
[]
[]
[]

-----INFO-----

1. General Information
Name: Veil of Deceit
Genre: Dark Fantasy / Card Game / Co-op / Bluff
Platforms: web app
Players: 2
Session Duration: (to define)
Target Audience: (to define)

2. High Concept

A two-player cooperative card game where players fight a boss together while hiding their hands and deceiving each other. Trust is optional. Survival is not.

3. Core Gameplay Loop
Players draw cards
Players discuss strategy (optional / unreliable)
Players choose actions secretly
Actions are revealed and resolved
Boss performs action
Apply effects (damage, status, etc.)
Repeat until:
    Boss is defeated or
    Players lose

4. Core Mechanics
Hidden hands
Bluff / deception
Shared objective (defeat boss)
Conflicting incentives (to define)
Resource management (to define)
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
├── railway.json
├── docker/
│   └── Dockerfile
└── env/
    ├── dev.env
    └── prod.env

🔄 Связь слоёв
React → API → Controller → Service → Game Engine → DB

