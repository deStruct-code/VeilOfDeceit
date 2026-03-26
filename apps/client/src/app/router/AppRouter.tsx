import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LobbyPage } from '../../pages/lobby/LobbyPage'
import { RoomPage } from '../../pages/room/RoomPage'
import { GamePage } from '../../pages/game/GamePage'

const router = createBrowserRouter([
  { path: '/', element: <LobbyPage /> },
  { path: '/room/:code', element: <RoomPage /> },
  { path: '/game/:code', element: <GamePage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

