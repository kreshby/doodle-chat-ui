import type { ChatMessage } from '../api/chatTypes'
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
  return (
    <section className={styles.history} aria-label="Chat history">
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
  )
}
