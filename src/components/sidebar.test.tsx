import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './sidebar'

function renderSidebar(path = '/dashboard', props: { forceCollapsed?: boolean } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar {...props} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('New Scan')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders the AuditFlow logo when expanded', () => {
    renderSidebar()
    expect(screen.getByText('AuditFlow')).toBeInTheDocument()
  })

  it('highlights the active nav item based on current route', () => {
    renderSidebar('/reports')
    const reportsLink = screen.getByText('Reports').closest('a')
    expect(reportsLink).toHaveClass('text-[#4F46E5]')
  })

  it('highlights Dashboard as active on /dashboard', () => {
    renderSidebar('/dashboard')
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('text-[#4F46E5]')
  })

  it('highlights Settings as active on /settings/* routes', () => {
    renderSidebar('/settings/account')
    const settingsLink = screen.getByText('Settings').closest('a')
    expect(settingsLink).toHaveClass('text-[#4F46E5]')
  })

  it('collapses and hides labels when toggle is clicked', async () => {
    const user = userEvent.setup()
    renderSidebar()

    expect(screen.getByText('Dashboard')).toBeVisible()
    const toggleBtn = screen.getByRole('button')
    await user.click(toggleBtn)

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('AuditFlow')).not.toBeInTheDocument()
  })

  it('expands again after a second toggle click', async () => {
    const user = userEvent.setup()
    renderSidebar()

    const toggleBtn = screen.getByRole('button')
    await user.click(toggleBtn)
    await user.click(toggleBtn)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  describe('forceCollapsed', () => {
    it('forceCollapsed hides nav labels', () => {
      renderSidebar('/dashboard', { forceCollapsed: true })
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('New Scan')).not.toBeInTheDocument()
      expect(screen.queryByText('Reports')).not.toBeInTheDocument()
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })

    it('forceCollapsed hides toggle button', () => {
      renderSidebar('/dashboard', { forceCollapsed: true })
      expect(screen.queryByRole('button')).toBeNull()
    })

    it('forceCollapsed=false preserves existing toggle behavior', async () => {
      const user = userEvent.setup()
      renderSidebar('/dashboard', { forceCollapsed: false })

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      const toggleBtn = screen.getByRole('button')
      await user.click(toggleBtn)
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })
  })
})
