import { Button } from '../../../shared/ui/Button'
import type { ChatMessage } from '../api/chatTypes'
import { useChatAutoScroll } from '../hooks/useChatAutoScroll'
import { MessageItem } from './MessageItem'
import styles from './MessageList.module.css'

type MessageListProps = {
  messages: ChatMessage[]
  currentAuthor: string | null
}

export function MessageList({
  messages,
  currentAuthor,
}: MessageListProps) {
  const {
    scrollContainerRef,
    showNewMessagesIndicator,
    scrollToBottom,
    handleScroll,
  } = useChatAutoScroll({ messages, currentAuthor })

  return (
    <div className={styles.history}>
      <section
        ref={scrollContainerRef}
        className={styles.scrollContainer}
        aria-label="Chat history"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <h2>No messages yet</h2>
            <p>Start the conversation.</p>
          </div>
        ) : (
          <div className={styles.messages}>
            {messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                currentAuthor={currentAuthor}
              />
            ))}
          </div>
        )}
      </section>
      {showNewMessagesIndicator && (
        <Button
          className={styles.newMessages}
          onClick={scrollToBottom}
        >
          New messages
        </Button>
      )}
    </div>
  )
}
