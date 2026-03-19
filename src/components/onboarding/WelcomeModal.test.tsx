import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WelcomeModal } from './WelcomeModal'

describe('WelcomeModal', () => {
  it('renders title and body when open', () => {
    render(<WelcomeModal open={true} onStart={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/you can perform one audit at no cost/i)).toBeInTheDocument()
    expect(screen.getByText(/start your first scan free/i)).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(<WelcomeModal open={false} onStart={vi.fn()} onClose={vi.fn()} />)
    expect(screen.queryByText(/you can perform one audit at no cost/i)).not.toBeInTheDocument()
  })

  it('calls onStart when "Let\'s Get Started!" clicked', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<WelcomeModal open={true} onStart={onStart} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /let's get started/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('calls onClose when dialog close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<WelcomeModal open={true} onStart={vi.fn()} onClose={onClose} />)
    // shadcn DialogContent renders a built-in Close button with aria-label="Close"
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
