export function generateRoomCode(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (n) => n % 10).join('')
}

export function normalizeRoomCode(input: string): string {
  return input.trim().replace(/[^0-9]/g, '')
}