import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

describe('App', () => {
  it('renders the chat screen', () => {
    render(<App />)

    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
  })
})
