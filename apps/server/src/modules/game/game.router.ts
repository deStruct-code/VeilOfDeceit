import { Router } from 'express'
import { gameRepository } from './game.repository'
import { roomRepository } from '../room/room.repository'
import { clone, createInitialGameState, resolveFullTurn } from '../../game/gameLogic'
import type { GameState } from '../../game/types'
import type { PlayerResultInput } from './game.repository'

export const gameRouter = Router()

function sanitizeId(raw: unknown): string {
    return String(raw || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6)
}

/** GET /api/game/:id */
gameRouter.get('/:id', async (req, res) => {
    const id = sanitizeId(req.params.id)
    try {
        const game = await gameRepository.findById(id)
        if (!game) { res.status(404).json({ error: 'Game not found' }); return }
        res.json(game)
    } catch (err) {
        console.error('[GET /api/game]', err)
        res.status(500).json({ error: 'Database error' })
    }
})

/** POST /api/game/:id/solo — создать игру с ботом */
gameRouter.post('/:id/solo', async (req, res) => {
    const id = sanitizeId(req.params.id)
    if (id.length !== 6) { res.status(400).json({ error: 'Invalid game id' }); return }

    const roomStatus = await roomRepository.getStatus(id)
    if (!roomStatus) {
        res.status(403).json({ error: 'Room code was not issued by the server.' })
        return
    }

    await roomRepository.setStatus(id, 'started')

    const playerName = String(req.body?.playerName || '').trim().slice(0, 24) || 'Player'

    try {
        const existing = await gameRepository.findById(id)
        if (existing) { res.json(existing); return }

        const state = createInitialGameState(id, playerName, 'Bot')
        state.isSolo = true
        await gameRepository.save(state)
        res.json(state)
    } catch (err) {
        console.error('[POST /api/game/solo]', err)
        res.status(500).json({ error: 'Database error' })
    }
})

/** POST /api/game/:id/action */
gameRouter.post('/:id/action', async (req, res) => {
    const id = sanitizeId(req.params.id)
    try {
        const game = await gameRepository.findById(id)
        if (!game) { res.status(404).json({ error: 'Game not found' }); return }

        const playerId = String(req.body?.playerId || '').trim() as 'player-1' | 'player-2'
        const cardIds: string[] = Array.isArray(req.body?.cardIds)
            ? req.body.cardIds.map((c: unknown) => String(c).trim()).filter(Boolean)
            : []

        const player = game.players.find(p => p.id === playerId)
        if (!player) { res.status(400).json({ error: 'Invalid playerId' }); return }
        if (player.submitted) { res.json(game); return }

        const validCardIds = cardIds.filter(cid => player.hand.some(c => c.id === cid))
        const totalCost = validCardIds.reduce((sum, cid) => {
            return sum + (player.hand.find(c => c.id === cid)?.cost ?? 0)
        }, 0)

        if (totalCost > player.energy) {
            res.status(400).json({ error: 'Not enough energy' })
            return
        }

        player.selectedCardId = validCardIds as unknown as string[]
        player.submitted = true

        if (game.isSolo) submitBotAction(game)

        let next: GameState
        if (game.players.every(p => p.submitted)) {
            next = resolveFullTurn(clone(game))
            next.isSolo = game.isSolo

            if (next.phase === 'victory' || next.phase === 'defeat') {
                // Получаем user_id игроков из room_players
                const roomPlayers = await roomRepository.getPlayers(id)
                const isVictory = next.phase === 'victory'

                const playerResults: PlayerResultInput[] = next.players
                    .filter(p => !game.isSolo || p.id === 'player-1') // не пишем бота
                    .map(p => {
                        const rp = roomPlayers.find(r => r.slot === p.id)
                        return {
                            gameId: id,
                            userId: rp?.userId ?? null,
                            playerId: rp?.playerId ?? p.id,
                            playerName: p.name,
                            slot: p.id,
                            outcome: isVictory ? 'win' : (p.hp > 0 ? 'win' : 'loss'),
                            hpLeft: p.hp,
                        }
                    })

                await gameRepository.saveResult(next, playerResults)
            }
        } else {
            next = game
        }

        await gameRepository.save(next)
        res.json(next)
    } catch (err) {
        console.error('[POST /api/game/action]', err)
        res.status(500).json({ error: 'Database error' })
    }
})

/** POST /api/game/:id/reset */
gameRouter.post('/:id/reset', async (req, res) => {
    const id = sanitizeId(req.params.id)
    if (id.length !== 6) { res.status(400).json({ error: 'Invalid game id' }); return }

    try {
        const existing = await gameRepository.findById(id)
        const isSolo = existing?.isSolo ?? false
        const p1Name = existing?.players[0]?.name ?? 'Player'
        const p2Name = isSolo ? 'Bot' : (existing?.players[1]?.name ?? 'Player 2')

        const next = createInitialGameState(id, p1Name, p2Name)
        next.isSolo = isSolo
        await gameRepository.save(next)
        res.json(next)
    } catch (err) {
        console.error('[POST /api/game/reset]', err)
        res.status(500).json({ error: 'Database error' })
    }
})

function submitBotAction(game: GameState): void {
    const bot = game.players.find(p => p.id === 'player-2')
    if (!bot || bot.submitted) return

    const selected: string[] = []
    let energy = bot.energy
    const shuffled = [...bot.hand].sort(() => Math.random() - 0.5)

    for (const card of shuffled) {
        if (card.cost <= energy) {
            selected.push(card.id)
            energy -= card.cost
        }
    }

    bot.selectedCardId = selected as unknown as string[]
    bot.submitted = true
}
