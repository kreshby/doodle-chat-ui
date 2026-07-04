import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from 'react'
import type { ChatMessage } from '../api/chatTypes'
import { isOwnMessage } from '../utils/isOwnMessage'

const NEAR_BOTTOM_THRESHOLD = 80

type UseChatAutoScrollOptions = {
  messages: readonly ChatMessage[]
  currentAuthor: string | null
}

export function useChatAutoScroll({
  messages,
  currentAuthor,
}: UseChatAutoScrollOptions) {
  const scrollContainerRef = useRef<HTMLElement>(null)
  const isNearBottomRef = useRef(true)
  const previousMessageCountRef = useRef<number | null>(null)
  const hasInitiallyScrolledRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const [
    showNewMessagesIndicator,
    setShowNewMessagesIndicator,
  ] = useState(false)

  const scrollToBottom = useCallback(() => {
    setShowNewMessagesIndicator(false)

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const container = scrollContainerRef.current

      if (container) {
        container.scrollTop = container.scrollHeight
        isNearBottomRef.current = true
      }

      hasInitiallyScrolledRef.current = true
      animationFrameRef.current = null
    })
  }, [])

  const handleScroll = useCallback(
    (event: UIEvent<HTMLElement>) => {
      const container = event.currentTarget
      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight
      const isNearBottom =
        distanceFromBottom < NEAR_BOTTOM_THRESHOLD

      isNearBottomRef.current = isNearBottom

      if (isNearBottom) {
        setShowNewMessagesIndicator(false)
      }
    },
    [],
  )

  useEffect(() => {
    const previousMessageCount = previousMessageCountRef.current
    const hasNewMessages =
      previousMessageCount !== null &&
      messages.length > previousMessageCount
    const hasNewOwnMessage =
      hasNewMessages &&
      isOwnMessage(
        messages[messages.length - 1]?.author ?? '',
        currentAuthor,
      )

    previousMessageCountRef.current = messages.length

    if (!hasInitiallyScrolledRef.current) {
      scrollToBottom()
    } else if (hasNewMessages) {
      if (isNearBottomRef.current || hasNewOwnMessage) {
        scrollToBottom()
      } else {
        setShowNewMessagesIndicator(true)
      }
    }
  }, [currentAuthor, messages, scrollToBottom])

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    },
    [],
  )

  return {
    scrollContainerRef,
    showNewMessagesIndicator,
    scrollToBottom,
    handleScroll,
  }
}
