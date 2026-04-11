import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GameState } from '@veil/shared'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
  || (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false')
const BASE_URL = USE_MOCKS
  ? '/api'
  : `${API_URL || 'http://localhost:8000'}/api`

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Game'],
  endpoints: (builder) => ({
    getGame: builder.query<GameState, string>({
      query: (id) => `/game/${id}`,
      providesTags: ['Game'],
    }),
    submitAction: builder.mutation<GameState, { gameId: string; playerId: string; cardIds: string[] }>({
      query: ({ gameId, playerId, cardIds }) => ({
        url: `/game/${gameId}/action`,
        method: 'POST',
        body: { playerId, cardIds },
      }),
      invalidatesTags: ['Game'],
    }),
    resetGame: builder.mutation<GameState, { gameId: string; playerId?: string }>({
      query: ({ gameId, playerId }) => ({
        url: `/game/${gameId}/reset`,
        method: 'POST',
        body: { playerId },
      }),
      invalidatesTags: ['Game'],
    }),
    createSoloGame: builder.mutation<GameState, { gameId: string; playerName: string }>({
      query: ({ gameId, playerName }) => ({
        url: `/game/${gameId}/solo`,
        method: 'POST',
        body: { playerName },
      }),
      invalidatesTags: ['Game'],
    }),
    createRoom: builder.mutation<{ code: string }, void>({
      query: () => ({ url: '/rooms', method: 'POST' }),
    }),
  }),
})

export const {
  useGetGameQuery,
  useSubmitActionMutation,
  useResetGameMutation,
  useCreateSoloGameMutation,
  useCreateRoomMutation,
} = gameApi
