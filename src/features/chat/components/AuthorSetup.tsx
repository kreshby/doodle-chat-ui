import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/ui/Button'
import { useCurrentAuthor } from '../hooks/useCurrentAuthor'
import styles from './AuthorSetup.module.css'

type AuthorSetupProps = {
  onAuthorSet?: (author: string) => void
}

export function AuthorSetup({ onAuthorSet }: AuthorSetupProps = {}) {
  const { author, setAuthor, clearAuthor, hasAuthor } =
    useCurrentAuthor()
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = setAuthor(input)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setError(null)
    onAuthorSet?.(input.trim())
  }

  if (hasAuthor) {
    return (
      <section className={styles.confirmation}>
        <p>Posting as {author}</p>
        <Button onClick={clearAuthor}>Change</Button>
      </section>
    )
  }

  return (
    <section className={styles.setup}>
      <h2>Choose your chat name</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="chat-author">Your name</label>
        <input
          id="chat-author"
          name="author"
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
            setError(null)
          }}
          aria-describedby={error ? 'chat-author-error' : undefined}
          aria-invalid={error ? true : undefined}
        />
        {error && (
          <p id="chat-author-error" className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Button type="submit">Continue</Button>
      </form>
    </section>
  )
}
