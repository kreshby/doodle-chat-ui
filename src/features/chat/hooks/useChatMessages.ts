import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { chatQueryKeys } from '../api/chatQueryKeys'
import { getMessages } from '../api/messagesApi'
import type { ChatMessage } from '../api/chatTypes'
import { getOverlappedTimestamp } from '../utils/getOverlappedTimestamp'
import { mergeMessages } from '../utils/mergeMessages'
import { sortMessages } from '../utils/sortMessages'

const MESSAGE_PAGE_SIZE = 50
const POLL_INTERVAL_MS = 3000

export function useChatMessages() {
  const queryClient = useQueryClient()
  const [initialBefore] = useState(() => new Date().toISOString())
  const query = useQuery({
    queryKey: chatQueryKeys.messages(),
    queryFn: async () =>
      sortMessages(
        await getMessages({
          before: initialBefore,
          limit: MESSAGE_PAGE_SIZE,
        }),
      ),
    refetchInterval: false,
  })
  const messages = query.data ?? []
  const latestCreatedAt = messages.at(-1)?.createdAt
  const pollingCursor = latestCreatedAt ?? initialBefore

  useEffect(() => {
    if (query.isLoading || query.isError) {
      return
    }

    let isMounted = true
    let isPolling = false

    const poll = async () => {
      if (isPolling) {
        return
      }

      isPolling = true

      try {
        const incoming = await getMessages({
          after: getOverlappedTimestamp(pollingCursor),
          limit: MESSAGE_PAGE_SIZE,
        })

        if (isMounted) {
          queryClient.setQueryData<ChatMessage[]>(
            chatQueryKeys.messages(),
            (existing = []) => mergeMessages(existing, incoming),
          )
        }
      } finally {
        isPolling = false
      }
    }

    const intervalId = window.setInterval(() => {
      void poll().catch(() => undefined)
    }, POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [pollingCursor, query.isError, query.isLoading, queryClient])

  return {
    messages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasMessages: messages.length > 0,
  }
}
