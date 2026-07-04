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
import { ChatScreen } from './ChatScreen'

vi.mock('../hooks/useChatMessages')
vi.mock('../hooks/useCurrentAuthor')

const message: ChatMessage = {
  _id: 'message-1',
  author: 'Grace',
  message: 'Hello Ada',
  createdAt: '2018-03-10T09:55:00',
}

const refetch = vi.fn()
const setAuthor = vi.fn()

function mockAuthor(author: string | null) {
  vi.mocked(useCurrentAuthor).mockReturnValue({
    author,
    setAuthor,
    clearAuthor: vi.fn(),
    hasAuthor: author !== null,
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
})

afterEach(cleanup)

describe('ChatScreen', () => {
  it('shows author setup when there is no current author', () => {
    mockAuthor(null)

    render(<ChatScreen />)

    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
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

  it('shows messages and the disabled composer', () => {
    mockAuthor('Ada')
    mockMessages({
      messages: [message],
      hasMessages: true,
    })

    render(<ChatScreen />)

    expect(screen.getByText('Hello Ada')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write a message')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })
})
