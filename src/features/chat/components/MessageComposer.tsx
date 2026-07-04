import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { Button } from '../../../shared/ui/Button'
import { useSendChatMessage } from '../hooks/useSendChatMessage'
import { validateMessageText } from '../utils/validateMessageText'
import styles from './MessageComposer.module.css'

type MessageComposerProps = {
  author: string
  onChangeAuthor: () => void
}

export function MessageComposer({
  author,
  onChangeAuthor,
}: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sendMessage = useSendChatMessage()
  const validation = validateMessageText(message)
  const isTooLong = message.trim().length > 500
  const isDisabled = !validation.ok || sendMessage.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validation.ok || sendMessage.isPending) {
      return
    }

    sendMessage.mutate(
      { message: validation.value, author },
      {
        onSuccess: () => {
          setMessage('')
          inputRef.current?.focus()
        },
      },
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return
    }

    event.preventDefault()

    if (event.shiftKey) {
      const input = event.currentTarget

      input.setRangeText(
        '\n',
        input.selectionStart,
        input.selectionEnd,
        'end',
      )
      setMessage(input.value)
      return
    }

    event.currentTarget.form?.requestSubmit()
  }

  return (
    <form
      className={styles.composer}
      aria-label="Message composer"
      onSubmit={handleSubmit}
      noValidate
    >
      <label className={styles.visuallyHidden} htmlFor="chat-message">
        Message
      </label>
      <textarea
        ref={inputRef}
        id="chat-message"
        name="message"
        rows={1}
        placeholder="Write a message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-describedby={
          isTooLong
            ? 'chat-message-validation-error'
            : sendMessage.isError
              ? 'chat-message-send-error'
              : undefined
        }
        aria-invalid={isTooLong || sendMessage.isError || undefined}
      />
      <Button
        className={styles.author}
        aria-label={`Change author, currently ${author}`}
        onClick={onChangeAuthor}
      >
        You: {author} ▾
      </Button>
      <Button type="submit" disabled={isDisabled}>
        {sendMessage.isPending ? 'Sending…' : 'Send'}
      </Button>
      {isTooLong && (
        <p
          id="chat-message-validation-error"
          className={styles.error}
          role="alert"
        >
          Message must be 500 characters or fewer.
        </p>
      )}
      {sendMessage.isError && (
        <p
          id="chat-message-send-error"
          className={styles.error}
          role="alert"
        >
          Message could not be sent. Please try again.
        </p>
      )}
    </form>
  )
}
