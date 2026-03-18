import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SettingsLayout } from './SettingsLayout'

function renderSettingsLayout(path = '/settings/account') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/settings" element={<SettingsLayout />}>
          <Route path="account" element={<div>Account Page</div>} />
          <Route path="security" element={<div>Security Page</div>} />
          <Route path="notifications" element={<div>Notifications Page</div>} />
          <Route path="plans" element={<div>Plans Page</div>} />
          <Route path="payments" element={<div>Payments Page</div>} />
          <Route path="credits" element={<div>Credits Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('SettingsLayout', () => {
  it('renders Settings heading', () => {
    renderSettingsLayout()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all 6 nav items', () => {
    renderSettingsLayout()
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Plans & Credits')).toBeInTheDocument()
    expect(screen.getByText('Payment History')).toBeInTheDocument()
    expect(screen.getByText('Credit History')).toBeInTheDocument()
  })

  it('renders outlet content', () => {
    renderSettingsLayout('/settings/account')
    expect(screen.getByText('Account Page')).toBeInTheDocument()
  })

  it('renders security page through outlet', () => {
    renderSettingsLayout('/settings/security')
    expect(screen.getByText('Security Page')).toBeInTheDocument()
  })

  it('active nav link has primary styling on /settings/account', () => {
    renderSettingsLayout('/settings/account')
    const accountLink = screen.getByText('Account').closest('a')
    expect(accountLink).toHaveClass('text-primary')
  })

  it('active nav link has primary styling on /settings/security', () => {
    renderSettingsLayout('/settings/security')
    const securityLink = screen.getByText('Security').closest('a')
    expect(securityLink).toHaveClass('text-primary')
  })

  it('inactive nav links do not have primary styling', () => {
    renderSettingsLayout('/settings/account')
    const securityLink = screen.getByText('Security').closest('a')
    expect(securityLink).not.toHaveClass('text-primary')
  })
})
