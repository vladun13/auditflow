import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Onboarding } from './Onboarding'
import { Tutorial } from './Tutorial'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val }),
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
})

function renderOnboarding() {
  return render(<MemoryRouter><Onboarding /></MemoryRouter>)
}

function renderTutorial() {
  return render(<MemoryRouter><Tutorial /></MemoryRouter>)
}

describe('Onboarding (AdditionalQuestions)', () => {
  it('renders the profile questions heading', () => {
    renderOnboarding()
    expect(screen.getByText(/tell us about your work/i)).toBeInTheDocument()
  })

  it('renders 3 select fields', () => {
    renderOnboarding()
    expect(screen.getByText(/what's your role/i)).toBeInTheDocument()
    expect(screen.getByText(/what are you scanning today/i)).toBeInTheDocument()
    expect(screen.getByText(/what's your primary goal/i)).toBeInTheDocument()
  })

  it('renders Continue button', () => {
    renderOnboarding()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('Continue button is disabled until all fields are selected', () => {
    renderOnboarding()
    const btn = screen.getByRole('button', { name: /continue/i })
    expect(btn).toBeDisabled()
  })
})

describe('Tutorial', () => {
  it('renders the tutorial heading', () => {
    renderTutorial()
    expect(screen.getByText(/let's run your first accessibility scan/i)).toBeInTheDocument()
  })

  it('renders Continue button on first step', () => {
    renderTutorial()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('advances to next step on Continue click', async () => {
    const user = userEvent.setup()
    renderTutorial()
    const step1Text = screen.getByText(/start with the website url/i)
    expect(step1Text).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /continue/i }))
    // Step 2 content appears
    expect(screen.getByText(/set your crawl depth|crawl depth|select crawl/i)).toBeInTheDocument()
  })

  it('Skip Tutorial sets localStorage and navigates to dashboard', async () => {
    const user = userEvent.setup()
    renderTutorial()
    await user.click(screen.getByRole('button', { name: /skip tutorial/i }))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('onboarding_complete', 'true')
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
