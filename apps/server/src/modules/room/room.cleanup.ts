import { roomRepository } from '../room/room.repository'

export function startRoomCleanup(intervalMs = 30 * 60 * 1000) {
    setInterval(async () => {
        try {
            await roomRepository.cleanup()
        } catch (err) {
            console.error('[room-cleanup]', err)
        }
    }, intervalMs)
}
