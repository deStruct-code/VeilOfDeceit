import { db } from '../../config/db'

export type RoomStatus = 'pending' | 'open' | 'started'
export type PlayerSlot = 'player-1' | 'player-2'

export interface RoomPlayer {
    playerId: string
    slot: PlayerSlot
    playerName: string
    cardBack: string
    userId: number | null
}

export const roomRepository = {

    /** Создать новую комнату со статусом pending (код выдан, но никто не подключился) */
    async create(code: string): Promise<void> {
        await db.query(
            `INSERT INTO rooms (code, status) VALUES ($1, 'pending')
             ON CONFLICT (code) DO NOTHING`,
            [code],
        )
    },

    /** Проверить что код был выдан сервером */
    async exists(code: string): Promise<boolean> {
        const { rows } = await db.query<{ code: string }>(
            `SELECT code FROM rooms WHERE code = $1`,
            [code],
        )
        return rows.length > 0
    },

    /** Получить статус комнаты */
    async getStatus(code: string): Promise<RoomStatus | null> {
        const { rows } = await db.query<{ status: RoomStatus }>(
            `SELECT status FROM rooms WHERE code = $1`,
            [code],
        )
        return rows[0]?.status ?? null
    },

    /** Обновить статус комнаты */
    async setStatus(code: string, status: RoomStatus): Promise<void> {
        await db.query(
            `UPDATE rooms SET status = $2 WHERE code = $1`,
            [code, status],
        )
    },

    /** Добавить игрока в комнату, вернуть его слот */
    async addPlayer(
        code: string,
        playerId: string,
        playerName: string,
        cardBack: string,
        userId: number | null = null,
    ): Promise<PlayerSlot> {
        // Узнаём занятые слоты
        const { rows: existing } = await db.query<{ slot: PlayerSlot }>(
            `SELECT slot FROM room_players WHERE room_code = $1`,
            [code],
        )

        const taken = new Set(existing.map(r => r.slot))
        const slot: PlayerSlot = taken.has('player-1') ? 'player-2' : 'player-1'

        await db.query(
            `INSERT INTO room_players (room_code, player_id, slot, player_name, card_back, user_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (room_code, player_id) DO UPDATE
               SET player_name = EXCLUDED.player_name,
                   card_back   = EXCLUDED.card_back,
                   user_id     = EXCLUDED.user_id`,
            [code, playerId, slot, playerName, cardBack, userId],
        )

        return slot
    },

    /** Получить всех игроков комнаты */
    async getPlayers(code: string): Promise<RoomPlayer[]> {
        const { rows } = await db.query<{
            player_id: string
            slot: PlayerSlot
            player_name: string
            card_back: string
            user_id: number | null
        }>(
            `SELECT player_id, slot, player_name, card_back, user_id
             FROM room_players WHERE room_code = $1
             ORDER BY joined_at`,
            [code],
        )
        return rows.map(r => ({
            playerId: r.player_id,
            slot: r.slot,
            playerName: r.player_name,
            cardBack: r.card_back,
            userId: r.user_id,
        }))
    },

    /** Удалить игрока из комнаты */
    async removePlayer(code: string, playerId: string): Promise<void> {
        await db.query(
            `DELETE FROM room_players WHERE room_code = $1 AND player_id = $2`,
            [code, playerId],
        )
    },

    /** Удалить пустые pending/open комнаты старше 2 часов */
    async cleanup(): Promise<void> {
        await db.query(
            `DELETE FROM rooms
             WHERE status != 'started'
               AND created_at < now() - INTERVAL '2 hours'`,
        )
    },
}
