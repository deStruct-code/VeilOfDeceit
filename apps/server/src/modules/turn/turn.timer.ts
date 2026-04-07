import { db } from '../../config/db'
import { gameRepository } from '../game/game.repository'
import { clone, resolveFullTurn } from '../../game/gameLogic'
import type { GameState } from '../../game/types'

export function startTurnTimer(intervalMs = 1000) {
    setInterval(async () => {
        try {
            const { rows } = await db.query<{ id: string; state: GameState }>(
                `SELECT id, state FROM games
                 WHERE (state->>'phase') = 'action'
                   AND (state->>'turnDeadline') IS NOT NULL
                   AND (state->>'turnDeadline')::bigint < $1`,
                [Date.now()],
            )

            for (const row of rows) {
                const game = row.state

                for (const player of game.players) {
                    if (!player.submitted) {
                        player.selectedCardId = [] as unknown as string[]
                        player.submitted = true
                    }
                }

                const next = resolveFullTurn(clone(game))
                next.isSolo = game.isSolo
                await gameRepository.save(next)
            }
        } catch (err) {
            console.error('[turn-timer]', err)
        }
    }, intervalMs)
}
