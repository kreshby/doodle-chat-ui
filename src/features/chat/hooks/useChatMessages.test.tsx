import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { chatQueryKeys } from '../api/chatQueryKeys'
import type { ChatMessage } from '../api/chatTypes'
import { getMessages } from '../api/messagesApi'
import { useChatMessages } from './useChatMessages'

vi.mock('../api/messagesApi', () => ({
  getMessages: vi.fn(),
}))

const olderMessage: ChatMessage = {
  _id: 'message-1',
  message: 'First',
  author: 'Ada',
  createdAt: '2026-07-04T10:00:00.000Z',
}

const latestMessage: ChatMessage = {
  _id: 'message-2',
  message: 'Second',
  author: 'Grace',
  createdAt: '2026-07-04T11:00:00.000Z',
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

beforeEach(() => {
  vi.mocked(getMessages).mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useChatMessages', () => {
  it('loads the latest page and exposes messages oldest-first', async () => {
    vi.mocked(getMessages).mockResolvedValue([
      latestMessage,
      olderMessage,
    ])
    const queryClient = createQueryClient()
    const { result, unmount } = renderHook(() => useChatMessages(), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isFetching).toBe(true)
    expect(result.current.hasMessages).toBe(false)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getMessages).toHaveBeenCalledWith({
      before: expect.any(String),
      limit: 50,
    })
    expect(
      Number.isNaN(
        Date.parse(vi.mocked(getMessages).mock.calls[0][0]?.before ?? ''),
      ),
    ).toBe(false)
    expect(result.current.messages).toEqual([
      olderMessage,
      latestMessage,
    ])
    expect(result.current.hasMessages).toBe(true)
    expect(result.current.isFetching).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.refetch).toEqual(expect.any(Function))

    unmount()
    queryClient.clear()
  })

  it('polls with an overlap and merges deduplicated messages into one cache entry', async () => {
    vi.useFakeTimers()
    const replacement = {
      ...latestMessage,
      message: 'Updated second',
    }
    const newMessage: ChatMessage = {
      _id: 'message-3',
      message: 'Third',
      author: 'Lin',
      createdAt: '2026-07-04T12:00:00.000Z',
    }
    vi.mocked(getMessages)
      .mockResolvedValueOnce([olderMessage, latestMessage])
      .mockResolvedValueOnce([replacement, newMessage])
    const queryClient = createQueryClient()
    const { result, unmount } = renderHook(() => useChatMessages(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(result.current.messages).toEqual([
      olderMessage,
      latestMessage,
    ])

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
      await Promise.resolve()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(getMessages).toHaveBeenNthCalledWith(2, {
      after: '2026-07-04T10:59:59.999Z',
      limit: 50,
    })
    expect(
      queryClient.getQueryData(chatQueryKeys.messages()),
    ).toEqual([olderMessage, replacement, newMessage])
    expect(
      queryClient.getQueryCache().findAll({
        queryKey: chatQueryKeys.all,
      }),
    ).toHaveLength(1)

    unmount()
    queryClient.clear()
  })

  it('exposes an initial query error', async () => {
    const error = new Error('Could not load messages')
    vi.mocked(getMessages).mockRejectedValue(error)
    const queryClient = createQueryClient()
    const { result } = renderHook(() => useChatMessages(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(error)
    expect(result.current.messages).toEqual([])

    queryClient.clear()
  })
})
