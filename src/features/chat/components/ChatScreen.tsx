import { Button } from '../../../shared/ui/Button'
import { Spinner } from '../../../shared/ui/Spinner'
import { useChatMessages } from '../hooks/useChatMessages'
import { useCurrentAuthor } from '../hooks/useCurrentAuthor'
import { AuthorSetup } from './AuthorSetup'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'
import styles from './ChatScreen.module.css'

type AuthoredChatProps = {
  currentAuthor: string
  onChangeAuthor: () => void
}

function AuthoredChat({
  currentAuthor,
  onChangeAuthor,
}: AuthoredChatProps) {
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

      <MessageComposer
        author={currentAuthor}
        onChangeAuthor={onChangeAuthor}
      />
    </main>
  )
}

export function ChatScreen() {
  const { author, setAuthor, clearAuthor } = useCurrentAuthor()

  if (!author) {
    return (
      <main className={styles.setupScreen}>
        <AuthorSetup onAuthorSet={(value) => void setAuthor(value)} />
      </main>
    )
  }

  return (
    <AuthoredChat
      currentAuthor={author}
      onChangeAuthor={clearAuthor}
    />
  )
}
