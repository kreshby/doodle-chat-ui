import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CURRENT_AUTHOR_STORAGE_KEY } from '../utils/currentAuthorStorage'
import { useCurrentAuthor } from './useCurrentAuthor'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('useCurrentAuthor', () => {
  it('initializes from localStorage', () => {
    localStorage.setItem(CURRENT_AUTHOR_STORAGE_KEY, 'Ada')

    const { result } = renderHook(() => useCurrentAuthor())

    expect(result.current.author).toBe('Ada')
    expect(result.current.hasAuthor).toBe(true)
  })

  it('sets a valid author and persists it', () => {
    const { result } = renderHook(() => useCurrentAuthor())

    act(() => {
      expect(result.current.setAuthor('  Grace Hopper  ')).toEqual({
        ok: true,
      })
    })

    expect(result.current.author).toBe('Grace Hopper')
    expect(localStorage.getItem(CURRENT_AUTHOR_STORAGE_KEY)).toBe(
      'Grace Hopper',
    )
  })

  it('rejects an invalid author', () => {
    const { result } = renderHook(() => useCurrentAuthor())

    act(() => {
      expect(result.current.setAuthor('José')).toEqual({
        ok: false,
        error:
          'Use only A-Z letters, numbers, spaces, hyphens, and underscores.',
      })
    })

    expect(result.current.author).toBeNull()
    expect(localStorage.getItem(CURRENT_AUTHOR_STORAGE_KEY)).toBeNull()
  })

  it('clears an author', () => {
    localStorage.setItem(CURRENT_AUTHOR_STORAGE_KEY, 'Ada')
    const { result } = renderHook(() => useCurrentAuthor())

    act(() => {
      result.current.clearAuthor()
    })

    expect(result.current.author).toBeNull()
    expect(result.current.hasAuthor).toBe(false)
    expect(localStorage.getItem(CURRENT_AUTHOR_STORAGE_KEY)).toBeNull()
  })
})
