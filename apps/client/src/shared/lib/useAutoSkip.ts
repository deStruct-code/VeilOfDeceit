import { useEffect, useRef } from 'react'

const TURN_SECONDS = 20

interface Options {
  isActive: boolean      // фаза === 'action'
  isSubmitted: boolean   // игрок уже сабмитился
  turnKey: number        // номер хода — сброс таймера
  onSkip: () => void     // вызвать Skip
}

export function useAutoSkip({ isActive, isSubmitted, turnKey, onSkip }: Options) {
  const onSkipRef = useRef(onSkip)
  onSkipRef.current = onSkip

  // Возвращаем оставшиеся секунды для отображения
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive || isSubmitted) {
      startRef.current = null
      return
    }

    startRef.current = Date.now()
    const timer = setTimeout(() => {
      onSkipRef.current()
    }, TURN_SECONDS * 1000)

    return () => clearTimeout(timer)
  }, [isActive, isSubmitted, turnKey])
}