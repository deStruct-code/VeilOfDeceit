export type PlayerSlot = 'player-1' | 'player-2'

export function roomSlotKey(roomCode: string) {
  return `veil.roomSlot.${roomCode}`
}

export function setRoomPlayerSlot(roomCode: string, slot: PlayerSlot) {
  sessionStorage.setItem(roomSlotKey(roomCode), slot)
}

export function getRoomPlayerSlot(roomCode: string): PlayerSlot | null {
  const v = sessionStorage.getItem(roomSlotKey(roomCode))
  if (v === 'player-1' || v === 'player-2') return v
  return null
}

