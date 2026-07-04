import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/api/ApiError'
import { getMessages, sendMessage } from './messagesApi'

const message = {
  _id: 'message-1',
  message: 'Hello',
  author: 'Ada',
  createdAt: '2026-07-04T10:00:00.000Z',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('messagesApi', () => {
  it('gets messages with query params and authorization', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([message])))
    const before = '2026-07-04T12:00:00.000Z'

    await expect(getMessages({ before, limit: 50 })).resolves.toEqual([message])

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(
      `http://localhost:3000/api/v1/messages?limit=50&before=${encodeURIComponent(before)}`,
    )
    expect(new Headers(options?.headers).get('Authorization')).toBe(
      'Bearer super-secret-doodle-token',
    )
  })

  it('posts a trimmed valid message body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(message)))

    await sendMessage({ message: '  Hello  ', author: '  Ada  ' })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:3000/api/v1/messages')
    expect(options?.method).toBe('POST')
    expect(options?.body).toBe(
      JSON.stringify({ message: 'Hello', author: 'Ada' }),
    )
    expect(new Headers(options?.headers).get('Content-Type')).toBe(
      'application/json',
    )
  })

  it('throws ApiError for a non-2xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: [{ field: 'message', message: 'Message is required' }],
            timestamp: '2026-07-04T10:00:00.000Z',
          },
        }),
        { status: 400 },
      ),
    )

    const result = getMessages()

    await expect(result).rejects.toBeInstanceOf(ApiError)
    await expect(result).rejects.toMatchObject({
      message: 'Message is required',
      status: 400,
    })
  })
})
