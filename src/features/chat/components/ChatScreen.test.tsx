import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { ChatMessage } from '../api/chatTypes'
import { useChatMessages } from '../hooks/useChatMessages'
import { useCurrentAuthor } from '../hooks/useCurrentAuthor'
import { useSendChatMessage } from '../hooks/useSendChatMessage'
import { ChatScreen } from './ChatScreen'

vi.mock('../hooks/useChatMessages')
vi.mock('../hooks/useCurrentAuthor')
vi.mock('../hooks/useSendChatMessage')

const message: ChatMessage = {
  _id: 'message-1',
  author: 'Grace',
  message: 'Hello Ada',
  createdAt: '2018-03-10T09:55:00',
}

const refetch = vi.fn()
const setAuthor = vi.fn()
const clearAuthor = vi.fn()
let initialAuthor: string | null

function mockAuthor(author: string | null) {
  initialAuthor = author
  vi.mocked(useCurrentAuthor).mockImplementation(() => {
    const [currentAuthor, setCurrentAuthor] = useState(initialAuthor)

    return {
      author: currentAuthor,
      setAuthor,
      clearAuthor: () => {
        clearAuthor()
        initialAuthor = null
        setCurrentAuthor(null)
      },
      hasAuthor: currentAuthor !== null,
    }
  })
}

function mockMessages(
  overrides: Partial<ReturnType<typeof useChatMessages>> = {},
) {
  vi.mocked(useChatMessages).mockReturnValue({
    messages: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch,
    hasMessages: false,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockMessages()
  vi.mocked(useSendChatMessage).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useSendChatMessage>)
})

afterEach(cleanup)

describe('ChatScreen', () => {
  it('shows author setup when there is no current author', () => {
    mockAuthor(null)

    render(<ChatScreen />)

    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
    expect(
      screen.queryByRole('form', { name: 'Message composer' }),
    ).not.toBeInTheDocument()
    expect(useChatMessages).not.toHaveBeenCalled()
  })

  it('shows a loading state', () => {
    mockAuthor('Ada')
    mockMessages({ isLoading: true })

    render(<ChatScreen />)

    expect(screen.getByText('Loading messages…')).toBeInTheDocument()
  })

  it('shows an error state and retries loading', async () => {
    const user = userEvent.setup()
    mockAuthor('Ada')
    mockMessages({ isError: true })

    render(<ChatScreen />)
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Messages could not be loaded.',
    )
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('shows messages and an active composer for the current author', () => {
    mockAuthor('Ada')
    mockMessages({
      messages: [message],
      hasMessages: true,
    })

    render(<ChatScreen />)

    expect(
      screen.getByRole('button', {
        name: 'Change author, currently Ada',
      }),
    ).toHaveTextContent('You: Ada ▾')
    expect(screen.getByText('Hello Ada')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write a message')).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('clears the current author and shows author setup', async () => {
    const user = userEvent.setup()
    mockAuthor('Ada')

    render(<ChatScreen />)
    await user.click(
      screen.getByRole('button', {
        name: 'Change author, currently Ada',
      }),
    )

    expect(clearAuthor).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
  })
})
