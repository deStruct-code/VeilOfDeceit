const KEY = 'veil.playerName.v1'
const ADJECTIVES = ['Silent', 'Hollow', 'Cursed', 'Veiled', 'Dark', 'Grim', 'Lost', 'Iron']
const NOUNS      = ['Wraith', 'Shade', 'Raven', 'Blade', 'Skull', 'Thorn', 'Ash', 'Veil']

function randomDefault(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj}${noun}`
}

export function getPlayerName(): string {
  return localStorage.getItem(KEY) || ''
}

export function savePlayerName(name: string): void {
  const trimmed = name.trim().slice(0, 24)
  if (trimmed) localStorage.setItem(KEY, trimmed)
}

export function getOrGeneratePlayerName(): string {
  const saved = getPlayerName()
  if (saved) return saved
  const generated = randomDefault()
  savePlayerName(generated)
  return generated
}
