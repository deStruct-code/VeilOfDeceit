import { db } from '../../config/db'
import type { GameState } from '../../game/types'

export interface PlayerResultInput {
    gameId: string
    userId: number | null
    playerId: string
    playerName: string
    slot: string
    outcome: 'win' | 'loss'
    hpLeft: number
}

export const gameRepository = {

    async findById(id: string): Promise<GameState | null> {
        const { rows } = await db.query<{ state: GameState }>(
            'SELECT state FROM games WHERE id = $1',
            [id],
        )
        return rows[0]?.state ?? null
    },

    async save(state: GameState): Promise<void> {
        await db.query(
            `INSERT INTO games (id, state)
             VALUES ($1, $2)
             ON CONFLICT (id) DO UPDATE
               SET state      = EXCLUDED.state,
                   updated_at = now()`,
            [state.id, JSON.stringify(state)],
        )
    },

    async delete(id: string): Promise<void> {
        await db.query('DELETE FROM games WHERE id = $1', [id])
    },

    /**
     * Записать итог завершённой игры.
     * playerResults — результат каждого живого участника (без бота).
     */
    async saveResult(
        state: GameState,
        playerResults: PlayerResultInput[],
    ): Promise<void> {
        if (state.phase !== 'victory' && state.phase !== 'defeat') return

        const outcome = state.phase === 'victory' ? 'victory' : 'defeat'

        // Итог всей игры
        await db.query(
            `INSERT INTO game_results (game_id, outcome, turns)
             VALUES ($1, $2, $3)`,
            [state.id, outcome, state.turn],
        )

        // Итог каждого игрока
        for (const r of playerResults) {
            await db.query(
                `INSERT INTO player_results
                   (game_id, user_id, player_id, player_name, slot, outcome, hp_left)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [r.gameId, r.userId, r.playerId, r.playerName, r.slot, r.outcome, r.hpLeft],
            )
        }
    },
}
