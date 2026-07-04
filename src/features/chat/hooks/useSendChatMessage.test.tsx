import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { chatQueryKeys } from '../api/chatQueryKeys'
import type {
  ChatMessage,
  CreateMessageInput,
} from '../api/chatTypes'
import { sendMessage } from '../api/messagesApi'
import { useSendChatMessage } from './useSendChatMessage'

vi.mock('../api/messagesApi', () => ({
  sendMessage: vi.fn(),
}))

const existingMessage: ChatMessage = {
  _id: 'message-1',
  message: 'First',
  author: 'Ada',
  createdAt: '2026-07-04T10:00:00.000Z',
}

const createdMessage: ChatMessage = {
  _id: 'message-2',
  message: 'Hello',
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

beforeEach(() => {
  vi.mocked(sendMessage).mockReset()
})

describe('useSendChatMessage', () => {
  it('sends a message and merges the response into the messages cache', async () => {
    vi.mocked(sendMessage).mockResolvedValue(createdMessage)
    const queryClient = new QueryClient()
    queryClient.setQueryData(
      chatQueryKeys.messages(),
      [existingMessage],
    )
    const { result } = renderHook(() => useSendChatMessage(), {
      wrapper: createWrapper(queryClient),
    })
    const input: CreateMessageInput = {
      message: 'Hello',
      author: 'Grace',
    }

    await act(async () => {
      await result.current.mutateAsync(input)
    })

    expect(sendMessage).toHaveBeenCalledOnce()
    expect(sendMessage).toHaveBeenCalledWith(input)
    expect(
      queryClient.getQueryData(chatQueryKeys.messages()),
    ).toEqual([existingMessage, createdMessage])

    queryClient.clear()
  })

  it('does not retry a failed send', async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error('Send failed'))
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: 3,
        },
      },
    })
    const { result } = renderHook(() => useSendChatMessage(), {
      wrapper: createWrapper(queryClient),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          message: 'Hello',
          author: 'Grace',
        })
      }),
    ).rejects.toThrow('Send failed')
    expect(sendMessage).toHaveBeenCalledOnce()

    queryClient.clear()
  })
})
