import type { BossDefinition } from '@veil/shared'

// ─── The Hollow Lich ──────────────────────────────────────────────────────────
// Первый босс. Две фазы.
// Фаза 1 (100%→50% HP): только атаки
// Фаза 2 (50%→0% HP):   атаки + статусы + специальные механики

export const HOLLOW_LICH: BossDefinition = {
  id:   'hollow_lich',
  name: 'Примитивный зомби',
  lore: 'Восставший из ада. Желающий кушать. ',

  maxHp: 100,

  spawnMessage: 'Зомби просыпается. Гробница трещит от его могучих ударов.',

  openingAction: {
    kind:   'attack',
    label:  'Soul Drain',
    damage: 12,
    target: 'both',
  },

  phases: [
    {
      phase:        1,
      hpThreshold:  1.0,   // активна с самого начала
      label:        'Dormant',
      passiveEffect: undefined,
      actionPool: [
        { kind: 'attack', label: 'Soul Drain',  damage: 12, target: 'both' },
        { kind: 'attack', label: 'Bone Crush',  damage: 18, target: 'player-1' },
        { kind: 'attack', label: 'Dark Lash',   damage: 15, target: 'player-2' },
      ],
    },
    {
      phase:        2,
      hpThreshold:  0.5,   // переход когда hp <= 50% maxHp
      label:        'Enraged',
      passiveEffect: 'The Lich\'s power surges — all attacks deal +4 damage.',
      actionPool: [
        { kind: 'attack',        label: 'Soul Drain',    damage: 16, target: 'both' },
        { kind: 'attack',        label: 'Bone Crush',    damage: 22, target: 'player-1' },
        { kind: 'attack',        label: 'Dark Lash',     damage: 19, target: 'player-2' },
        { kind: 'status',        label: 'Curse of Rot',  target: 'both',     status: { type: 'poison',   stacks: 3 } },
        { kind: 'status',        label: 'Enfeeble',      target: 'player-1', status: { type: 'weakness', stacks: 2 } },
        { kind: 'attack_status', label: 'Necrotic Bite', damage: 8, target: 'player-2', status: { type: 'poison', stacks: 2 } },
        { kind: 'burn_cards',    label: 'Void Hunger',   target: 'random',   count: 2 },
      ],
    },
  ],
}