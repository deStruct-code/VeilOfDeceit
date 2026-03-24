import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GameState } from '../types/game'

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
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
