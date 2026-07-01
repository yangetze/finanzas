import { useEffect, useRef } from 'react'

export function ScrollAnchor() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  return <div ref={ref} />
}
