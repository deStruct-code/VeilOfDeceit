export type LobbyClientMessage =
  | { type: 'join'; roomCode: string; playerId: string; playerName: string }

export type LobbyServerMessage =
  | { type: 'joined'; roomCode: string; playerCount: number; slot: 'player-1' | 'player-2' }
  | { type: 'ready'; roomCode: string; playerCount: number }
  | { type: 'error'; message: string }

function getWsBaseUrl(): string {
  const explicit = (import.meta.env.VITE_WS_URL ?? '').trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const apiUrl = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')
  if (apiUrl) {
    return apiUrl.replace(/^http/i, 'ws')
  }

  const { protocol, host } = window.location
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
  return `${wsProtocol}//${host}`
}

export function createLobbySocket(): WebSocket {
  return new WebSocket(`${getWsBaseUrl()}/ws`)
}
