import './global.css'
import { AppProviders } from './providers/AppProviders'
import { GamePage } from '../pages/game/GamePage'

export function App() {
  return (
    <AppProviders>
      <GamePage />
    </AppProviders>
  )
}
