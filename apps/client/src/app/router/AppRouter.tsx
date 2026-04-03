import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom'
import { LobbyPage } from '../../pages/lobby/LobbyPage'
import { GamePage } from '../../pages/game/GamePage'

function RoomRedirect() {
  const { code } = useParams<{ code: string }>()
  return <Navigate to={`/?join=${code ?? ''}`} replace />
}

const router = createBrowserRouter([
  { path: '/', element: <LobbyPage /> },
  { path: '/room/:code', element: <RoomRedirect /> },
  { path: '/game/:code', element: <GamePage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

