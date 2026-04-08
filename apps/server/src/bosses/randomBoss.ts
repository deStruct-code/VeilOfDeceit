import type { BossAction, BossDefinition } from '@veil/shared'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Name / lore pool ─────────────────────────────────────────────────────────

const BOSS_POOL: { name: string; lore: string }[] = [
  { name: 'The Hollow Warden',   lore: 'A forgotten guardian, rotted from within. Still watches.' },
  { name: 'Rot Sovereign',       lore: 'Crowned in decay. Worshipped by the dead.' },
  { name: 'Veilborn Tyrant',     lore: 'Born from the tear between worlds. Craves flesh.' },
  { name: 'The Ashen Judge',     lore: 'It sentenced thousands. Now it sentences you.' },
  { name: 'Dusk Eater',          lore: 'Feasts on the last light of the dying.' },
  { name: 'Gravemind Revenant',  lore: 'Stitched from fallen warriors. Remembers every wound.' },
  { name: 'The Pale Sovereign',  lore: 'White as bone. Cold as the end.' },
  { name: 'Sorrow Colossus',     lore: 'It does not hate. It simply endures — and crushes.' },
]

// ─── Action label pools ───────────────────────────────────────────────────────

const ATTACK_LABELS = ['Soul Drain', 'Bone Crush', 'Dark Lash', 'Void Slam', 'Grave Tide', 'Ashen Strike']
const STATUS_LABELS = ['Curse of Rot', 'Enfeeble', 'Wither', 'Plague Mark', 'Necrotic Aura']
const SPECIAL_LABELS = ['Void Hunger', 'Soul Rend', 'Darkness Rising']

// ─── Generator ────────────────────────────────────────────────────────────────

export function generateRandomBoss(): BossDefinition {
  const { name, lore } = pick(BOSS_POOL)
  const maxHp = randInt(60, 150)

  // Phase 1 actions — pure attacks
  const p1Dmg1 = randInt(10, 18)
  const p1Dmg2 = randInt(10, 18)
  const p1Dmg3 = randInt(10, 18)

  const phase1Actions: BossAction[] = [
    { kind: 'attack', label: pick(ATTACK_LABELS), damage: p1Dmg1, target: 'both' },
    { kind: 'attack', label: pick(ATTACK_LABELS), damage: p1Dmg2, target: 'player-1' },
    { kind: 'attack', label: pick(ATTACK_LABELS), damage: p1Dmg3, target: 'player-2' },
  ]

  // Phase 2 actions — upgraded attacks + status/special
  const phase2Actions: BossAction[] = [
    { kind: 'attack', label: pick(ATTACK_LABELS), damage: p1Dmg1 + 4, target: 'both' },
    { kind: 'attack', label: pick(ATTACK_LABELS), damage: p1Dmg2 + 4, target: 'player-1' },
    { kind: 'attack', label: pick(ATTACK_LABELS), damage: p1Dmg3 + 4, target: 'player-2' },
    { kind: 'status',        label: pick(STATUS_LABELS),  target: 'both',     status: { type: 'poison',   stacks: randInt(2, 4) } },
    { kind: 'status',        label: pick(STATUS_LABELS),  target: 'player-1', status: { type: 'weakness', stacks: randInt(1, 3) } },
    { kind: 'attack_status', label: pick(ATTACK_LABELS),  target: 'player-2', damage: randInt(6, 12), status: { type: 'poison', stacks: 2 } },
    { kind: 'burn_cards',    label: pick(SPECIAL_LABELS), target: 'random',   count: randInt(1, 3) },
  ]

  const openingDmg = randInt(8, 15)

  return {
    id:   `random_boss_${Date.now()}`,
    name,
    lore,
    maxHp,
    spawnMessage: `${name} awakens. The air turns cold.`,
    openingAction: {
      kind:   'attack',
      label:  pick(ATTACK_LABELS),
      damage: openingDmg,
      target: 'both',
    },
    phases: [
      {
        phase:        1,
        hpThreshold:  1.0,
        label:        'Lurking',
        actionPool:   phase1Actions,
      },
      {
        phase:        2,
        hpThreshold:  0.5,
        label:        'Enraged',
        passiveEffect: `${name}'s power surges — attacks grow fiercer.`,
        actionPool:   phase2Actions,
      },
    ],
  }
}
