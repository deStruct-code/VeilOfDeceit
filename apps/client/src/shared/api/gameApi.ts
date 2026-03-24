import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GameState } from '../types/game'

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
    submitAction: builder.mutation<GameState, { gameId: string; playerId: string; cardId: string }>({
      query: ({ gameId, playerId, cardId }) => ({
        url: `/game/${gameId}/action`,
        method: 'POST',
        body: { playerId, cardId },
      }),
      invalidatesTags: ['Game'],
    }),
    resetGame: builder.mutation<GameState, void>({
      query: () => ({ url: '/game/reset', method: 'POST' }),
      invalidatesTags: ['Game'],
    }),
  }),
})

export const { useGetGameQuery, useSubmitActionMutation, useResetGameMutation } = gameApi
