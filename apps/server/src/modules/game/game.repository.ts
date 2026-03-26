import { db } from '../../config/db';
import type { GameState } from '../../game/types';

export const gameRepository = {

  async findById(id: string): Promise<GameState | null> {
    const { rows } = await db.query<{ state: GameState }>(
      'SELECT state FROM games WHERE id = $1',
      [id],
    );
    return rows[0]?.state ?? null;
  },

  async save(state: GameState): Promise<void> {
    await db.query(
      `INSERT INTO games (id, state)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE
         SET state = EXCLUDED.state,
             updated_at = now()`,
      [state.id, JSON.stringify(state)],
    );
  },

  async delete(id: string): Promise<void> {
    await db.query('DELETE FROM games WHERE id = $1', [id]);
  },

  /** Записать итог завершённой игры в game_results */
  async saveResult(state: GameState): Promise<void> {
    if (state.phase !== 'victory' && state.phase !== 'defeat') return;
    await db.query(
      `INSERT INTO game_results (game_id, winner, turns)
       VALUES ($1, $2, $3)`,
      [
        state.id,
        state.phase === 'victory' ? 'players' : 'boss',
        state.turn,
      ],
    );
  },
};
