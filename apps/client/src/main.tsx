import { createRoot } from 'react-dom/client'
import { App } from './app/index'

async function bootstrap() {
  const shouldUseMocks = import.meta.env.VITE_USE_MOCKS === 'true'
  if (shouldUseMocks) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
  createRoot(document.getElementById('root')!).render(<App />)
}

bootstrap()
