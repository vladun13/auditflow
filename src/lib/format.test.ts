import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatRelativeTime, getScoreColor, getScoreBg } from './format'

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for dates less than 60 seconds ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:30Z'))
    expect(formatRelativeTime('2024-06-15T12:00:00Z')).toBe('just now')
  })

  it('returns minutes ago for dates less than 60 minutes ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:05:00Z'))
    expect(formatRelativeTime('2024-06-15T12:00:00Z')).toBe('5m ago')
  })

  it('returns hours ago for dates less than 24 hours ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T15:00:00Z'))
    expect(formatRelativeTime('2024-06-15T12:00:00Z')).toBe('3h ago')
  })

  it('returns days ago for dates less than 7 days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-17T12:00:00Z'))
    expect(formatRelativeTime('2024-06-15T12:00:00Z')).toBe('2d ago')
  })

  it('returns weeks ago for dates less than 30 days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-29T12:00:00Z'))
    expect(formatRelativeTime('2024-06-15T12:00:00Z')).toBe('2w ago')
  })

  it('returns formatted date DD/MM/YYYY for dates 30+ days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-08-01T12:00:00Z'))
    expect(formatRelativeTime('2024-06-15T12:00:00Z')).toBe('15/06/2024')
  })
})

describe('getScoreColor', () => {
  it('returns text-green-600 for scores >= 80', () => {
    expect(getScoreColor(85)).toBe('text-green-600')
    expect(getScoreColor(80)).toBe('text-green-600')
    expect(getScoreColor(100)).toBe('text-green-600')
  })

  it('returns text-yellow-600 for scores >= 60 and < 80', () => {
    expect(getScoreColor(70)).toBe('text-yellow-600')
    expect(getScoreColor(60)).toBe('text-yellow-600')
    expect(getScoreColor(79)).toBe('text-yellow-600')
  })

  it('returns text-red-600 for scores < 60', () => {
    expect(getScoreColor(50)).toBe('text-red-600')
    expect(getScoreColor(0)).toBe('text-red-600')
    expect(getScoreColor(59)).toBe('text-red-600')
  })
})

describe('getScoreBg', () => {
  it('returns bg-green-50 for scores >= 80', () => {
    expect(getScoreBg(85)).toBe('bg-green-50')
    expect(getScoreBg(80)).toBe('bg-green-50')
  })

  it('returns bg-yellow-50 for scores >= 60 and < 80', () => {
    expect(getScoreBg(70)).toBe('bg-yellow-50')
    expect(getScoreBg(60)).toBe('bg-yellow-50')
  })

  it('returns bg-red-50 for scores < 60', () => {
    expect(getScoreBg(50)).toBe('bg-red-50')
    expect(getScoreBg(0)).toBe('bg-red-50')
  })
})
