import type { ChatMessage } from '../api/chatTypes'
import { formatMessageDate } from '../utils/formatMessageDate'
import { isOwnMessage } from '../utils/isOwnMessage'
import styles from './MessageItem.module.css'

type MessageItemProps = {
  message: ChatMessage
  currentAuthor: string | null
}

export function MessageItem({
  message,
  currentAuthor,
}: MessageItemProps) {
  const ownMessage = isOwnMessage(message.author, currentAuthor)
  const authorLabel = ownMessage ? 'You' : message.author

  return (
    <article
      className={`${styles.message} ${ownMessage ? styles.own : styles.foreign}`}
      aria-label={`Message from ${authorLabel}`}
    >
      <header className={styles.header}>
        <strong>{authorLabel}</strong>
        <time dateTime={message.createdAt}>
          {formatMessageDate(message.createdAt)}
        </time>
      </header>
      <p className={styles.text}>{message.message}</p>
    </article>
  )
}
