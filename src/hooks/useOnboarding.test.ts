import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from './useOnboarding'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val }),
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
})

describe('useOnboarding', () => {
  it('shows welcome when onboarding flag is absent', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const { result } = renderHook(() => useOnboarding())
    expect(result.current.showWelcome).toBe(true)
  })

  it('does not show welcome when onboarding flag is set', () => {
    localStorageMock.getItem.mockReturnValue('true')
    const { result } = renderHook(() => useOnboarding())
    expect(result.current.showWelcome).toBe(false)
  })

  it('completeOnboarding sets localStorage flag and hides modal', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const { result } = renderHook(() => useOnboarding())
    act(() => { result.current.completeOnboarding() })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('welcome_seen', 'true')
    expect(result.current.showWelcome).toBe(false)
  })

  it('completeTutorial sets tutorial localStorage flag', () => {
    localStorageMock.getItem.mockReturnValue('true')
    const { result } = renderHook(() => useOnboarding())
    act(() => { result.current.completeTutorial() })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('tutorial_complete', 'true')
  })

  it('saveProfile serializes profile to localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true')
    const { result } = renderHook(() => useOnboarding())
    const profile = { role: 'Frontend Developer', scanning: 'My company website', goal: 'Fix violations' }
    act(() => { result.current.saveProfile(profile) })
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'onboarding_answers',
      JSON.stringify(profile)
    )
  })
})
