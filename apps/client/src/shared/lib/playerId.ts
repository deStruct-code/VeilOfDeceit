const KEY = 'veil.playerId.v1'

export function getOrCreatePlayerId(): string {
  const existing = localStorage.getItem(KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(KEY, id)
  return id
}

