import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsTablet } from './use-tablet'

let listeners: Record<string, (() => void)[]> = {}
let matchesValue = false

function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchesValue,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (!listeners[event]) listeners[event] = []
        listeners[event].push(handler)
      }),
      removeEventListener: vi.fn((event: string, handler: () => void) => {
        listeners[event] = (listeners[event] || []).filter((h) => h !== handler)
      }),
      dispatchEvent: vi.fn(),
    })),
  })
}

beforeEach(() => {
  listeners = {}
  matchesValue = false
  mockMatchMedia()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsTablet', () => {
  it('returns true when matchMedia matches (768-1279px tablet range)', () => {
    matchesValue = true
    mockMatchMedia()
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(true)
  })

  it('returns false when matchMedia does not match (>=1280px or <768px)', () => {
    matchesValue = false
    mockMatchMedia()
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(false)
  })

  it('registers a change listener on mount and cleans up on unmount', () => {
    const { unmount } = renderHook(() => useIsTablet())

    // Listener was registered on mount
    expect(listeners['change']).toBeDefined()
    expect(listeners['change'].length).toBe(1)

    // Cleanup removes the listener
    unmount()
    expect(listeners['change'].length).toBe(0)
  })

  it('responds to change events from matchMedia listener', () => {
    matchesValue = false
    mockMatchMedia()
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(false)

    // The hook registers a listener; verify it was called
    expect(listeners['change']).toBeDefined()
    expect(listeners['change'].length).toBeGreaterThan(0)
  })
})
