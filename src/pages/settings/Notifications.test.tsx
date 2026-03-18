import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { Notifications } from './Notifications'

// Factory must not reference outer variables (vi.mock is hoisted)
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

function renderNotifications() {
  return render(
    <MemoryRouter>
      <Notifications />
    </MemoryRouter>,
  )
}

describe('Notifications', () => {
  it('renders Notifications heading', () => {
    renderNotifications()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('renders all 4 notification preferences', () => {
    renderNotifications()
    expect(screen.getByText('Scan completed')).toBeInTheDocument()
    expect(screen.getByText('Weekly summary')).toBeInTheDocument()
    expect(screen.getByText('Low credit warning')).toBeInTheDocument()
    expect(screen.getByText('Promotional emails')).toBeInTheDocument()
  })

  it('shows scan_complete as enabled by default', () => {
    renderNotifications()
    const switches = screen.getAllByRole('switch')
    expect(switches[0]).toHaveAttribute('aria-checked', 'true')
  })

  it('shows weekly summary as disabled by default', () => {
    renderNotifications()
    const switches = screen.getAllByRole('switch')
    expect(switches[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles a notification pref on click', async () => {
    const user = userEvent.setup()
    renderNotifications()

    const switches = screen.getAllByRole('switch')
    expect(switches[0]).toHaveAttribute('aria-checked', 'true')
    await user.click(switches[0])
    expect(switches[0]).toHaveAttribute('aria-checked', 'false')
  })

  it('saves preferences and shows success toast', async () => {
    const user = userEvent.setup()
    renderNotifications()

    await user.click(screen.getByRole('button', { name: /save preferences/i }))

    await waitFor(() =>
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Notification preferences saved')
    )
  })

  it('renders Save preferences button', () => {
    renderNotifications()
    expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument()
  })
})
