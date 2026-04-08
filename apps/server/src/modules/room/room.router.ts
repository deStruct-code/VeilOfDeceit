import { Router } from 'express'
import crypto from 'crypto'
import { roomRepository } from '../room/room.repository'

export const roomRouter = Router()

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateRoomCode(): string {
    const bytes = crypto.randomBytes(6)
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += ALPHABET[bytes[i] % ALPHABET.length]
    }
    return code
}

/** POST /api/rooms — выдать новый код комнаты */
roomRouter.post('/', async (_req, res) => {
    try {
        let code: string
        let attempts = 0
        do {
            code = generateRoomCode()
            attempts++
            if (attempts > 10) {
                res.status(500).json({ error: 'Failed to generate unique room code' })
                return
            }
        } while (await roomRepository.exists(code))

        await roomRepository.create(code)
        res.json({ code })
    } catch (err) {
        console.error('[POST /api/rooms]', err)
        res.status(500).json({ error: 'Database error' })
    }
})

/** GET /api/rooms/:code — информация о комнате */
roomRouter.get('/:code', async (req, res) => {
    const code = String(req.params.code || '').toUpperCase().slice(0, 6)
    try {
        const players = await roomRepository.getPlayers(code)
        res.json({ code, playerCount: players.length, capacity: 2 })
    } catch (err) {
        console.error('[GET /api/rooms/:code]', err)
        res.status(500).json({ error: 'Database error' })
    }
})
