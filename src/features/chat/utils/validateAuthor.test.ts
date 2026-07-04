import { describe, expect, it } from 'vitest'
import { validateAuthor } from './validateAuthor'

describe('validateAuthor', () => {
  it('trims a valid author', () => {
    expect(validateAuthor('  Ada Lovelace  ')).toEqual({
      ok: true,
      value: 'Ada Lovelace',
    })
  })

  it.each(['', '   '])('rejects an empty author', (author) => {
    expect(validateAuthor(author)).toEqual({
      ok: false,
      error: 'Enter your name.',
    })
  })

  it('rejects an author over 50 characters', () => {
    expect(validateAuthor('a'.repeat(51))).toEqual({
      ok: false,
      error: 'Name must be 50 characters or fewer.',
    })
  })

  it('rejects a non-ASCII author', () => {
    expect(validateAuthor('Łukasz')).toEqual({
      ok: false,
      error:
        'Use only A-Z letters, numbers, spaces, hyphens, and underscores.',
    })
  })

  it('accepts letters, numbers, spaces, hyphens, and underscores', () => {
    expect(validateAuthor('Ada 2_test-user')).toEqual({
      ok: true,
      value: 'Ada 2_test-user',
    })
  })
})
