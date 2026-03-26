export function generateRoomCode(length = 6): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  crypto.getRandomValues(new Uint32Array(length)).forEach((n) => {
    out += alphabet[n % alphabet.length]
  })
  return out
}

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

