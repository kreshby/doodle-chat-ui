import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ChatMessage } from '../api/chatTypes'
import { MessageItem } from './MessageItem'

const message: ChatMessage = {
  _id: 'message-1',
  author: 'Ada',
  message: 'Hello\nIt&#39;s me',
  createdAt: '2018-03-10T09:55:00',
}

afterEach(cleanup)

describe('MessageItem', () => {
  it('renders an own message with its text and date', () => {
    render(<MessageItem message={message} currentAuthor="Ada" />)

    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText(/Hello/)).toHaveTextContent(
      "Hello It&#39;s me",
    )
    expect(screen.getByText('10 Mar 2018 9:55')).toBeInTheDocument()
  })

  it('renders the author of a foreign message', () => {
    render(<MessageItem message={message} currentAuthor="Grace" />)

    expect(screen.getByText('Ada')).toBeInTheDocument()
  })

  it('renders message content as text rather than HTML', () => {
    const htmlMessage = {
      ...message,
      message: '<img src=x onerror=alert(1)>',
    }
    const { container } = render(
      <MessageItem message={htmlMessage} currentAuthor={null} />,
    )

    expect(
      screen.getByText('<img src=x onerror=alert(1)>'),
    ).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })
})
