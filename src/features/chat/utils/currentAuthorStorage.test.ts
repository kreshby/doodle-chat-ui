import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearCurrentAuthor,
  CURRENT_AUTHOR_STORAGE_KEY,
  readCurrentAuthor,
  writeCurrentAuthor,
} from './currentAuthorStorage'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('currentAuthorStorage', () => {
  it('reads a missing author as null', () => {
    expect(readCurrentAuthor()).toBeNull()
  })

  it('writes and reads an author', () => {
    writeCurrentAuthor('Ada')

    expect(readCurrentAuthor()).toBe('Ada')
    expect(localStorage.getItem(CURRENT_AUTHOR_STORAGE_KEY)).toBe('Ada')
  })

  it('clears an author', () => {
    writeCurrentAuthor('Ada')

    clearCurrentAuthor()

    expect(readCurrentAuthor()).toBeNull()
  })

  it('does not throw when storage is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'localStorage',
    )

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('Storage unavailable')
      },
    })

    try {
      expect(readCurrentAuthor()).toBeNull()
      expect(() => writeCurrentAuthor('Ada')).not.toThrow()
      expect(clearCurrentAuthor).not.toThrow()
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, 'localStorage', descriptor)
      }
    }
  })
})
