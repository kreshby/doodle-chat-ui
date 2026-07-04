import { Button } from '../../../shared/ui/Button'
import { Spinner } from '../../../shared/ui/Spinner'
import { useChatMessages } from '../hooks/useChatMessages'
import { useCurrentAuthor } from '../hooks/useCurrentAuthor'
import { AuthorSetup } from './AuthorSetup'
import { MessageList } from './MessageList'
import styles from './ChatScreen.module.css'

type AuthoredChatProps = {
  currentAuthor: string
}

function AuthoredChat({ currentAuthor }: AuthoredChatProps) {
  const { messages, isLoading, isError, refetch } = useChatMessages()

  return (
    <main className={styles.screen}>
      {isLoading ? (
        <div className={styles.status}>
          <Spinner />
          <p>Loading messages…</p>
        </div>
      ) : isError ? (
        <div className={styles.status} role="alert">
          <p>Messages could not be loaded.</p>
          <Button onClick={() => void refetch()}>Retry</Button>
        </div>
      ) : (
        <MessageList
          messages={messages}
          currentAuthor={currentAuthor}
        />
      )}

      <form className={styles.composer} aria-label="Message composer">
        <label className={styles.visuallyHidden} htmlFor="chat-message">
          Message
        </label>
        <textarea
          id="chat-message"
          rows={1}
          placeholder="Write a message"
          disabled
        />
        {/* TODO: Connect the composer to the sending flow in the next task. */}
        <Button type="submit" disabled>
          Send
        </Button>
      </form>
    </main>
  )
}

export function ChatScreen() {
  const { author, setAuthor } = useCurrentAuthor()

  if (!author) {
    return (
      <main className={styles.setupScreen}>
        <AuthorSetup onAuthorSet={(value) => void setAuthor(value)} />
      </main>
    )
  }

  return <AuthoredChat currentAuthor={author} />
}
