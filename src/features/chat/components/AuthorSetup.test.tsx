import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CURRENT_AUTHOR_STORAGE_KEY } from '../utils/currentAuthorStorage'
import { AuthorSetup } from './AuthorSetup'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('AuthorSetup', () => {
  it('renders the author input when no author exists', () => {
    render(<AuthorSetup />)

    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument()
  })

  it('shows a validation error for an invalid author', async () => {
    const user = userEvent.setup()
    render(<AuthorSetup />)

    await user.type(screen.getByLabelText('Your name'), 'José')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Use only A-Z letters, numbers, spaces, hyphens, and underscores.',
    )
  })

  it('clears a validation error when the author is edited', async () => {
    const user = userEvent.setup()
    render(<AuthorSetup />)
    const input = screen.getByLabelText('Your name')

    await user.type(input, 'José')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.type(input, 'e')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('persists and confirms a valid author after submit', async () => {
    const user = userEvent.setup()
    render(<AuthorSetup />)

    await user.type(screen.getByLabelText('Your name'), '  Ada  ')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Posting as Ada')).toBeInTheDocument()
    expect(localStorage.getItem(CURRENT_AUTHOR_STORAGE_KEY)).toBe('Ada')
  })

  it('allows the author to be changed', async () => {
    localStorage.setItem(CURRENT_AUTHOR_STORAGE_KEY, 'Ada')
    const user = userEvent.setup()
    render(<AuthorSetup />)

    expect(screen.getByText('Posting as Ada')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
    expect(localStorage.getItem(CURRENT_AUTHOR_STORAGE_KEY)).toBeNull()
  })
})
