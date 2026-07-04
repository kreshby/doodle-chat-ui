import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ChatMessage } from '../api/chatTypes'
import { MessageList } from './MessageList'

const messages: ChatMessage[] = [
  {
    _id: 'message-1',
    author: 'Ada',
    message: 'First message',
    createdAt: '2018-03-10T09:55:00',
  },
  {
    _id: 'message-2',
    author: 'Grace',
    message: 'Second message',
    createdAt: '2018-03-10T09:56:00',
  },
]

afterEach(cleanup)

describe('MessageList', () => {
  it('renders an empty state', () => {
    render(<MessageList messages={[]} currentAuthor="Ada" />)

    expect(screen.getByText('No messages yet')).toBeInTheDocument()
    expect(screen.getByText('Start the conversation.')).toBeInTheDocument()
  })

  it('renders multiple messages in the chat history', () => {
    render(<MessageList messages={messages} currentAuthor="Ada" />)

    expect(
      screen.getByRole('region', { name: 'Chat history' }),
    ).toBeInTheDocument()
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })
})
