import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { ChatMessage } from '../api/chatTypes'
import { MessageList } from './MessageList'

const messages: ChatMessage[] = [
  {
    _id: 'message-1',
    author: 'Ada',
    message: 'First message',
    createdAt: '2018-03-10T09:55:00',
  },
  {
    _id: 'message-2',
    author: 'Grace',
    message: 'Second message',
    createdAt: '2018-03-10T09:56:00',
  },
]

let animationFrameCallbacks: FrameRequestCallback[] = []

function setScrollLayout(
  element: HTMLElement,
  {
    scrollHeight,
    clientHeight,
    scrollTop,
  }: {
    scrollHeight: number
    clientHeight: number
    scrollTop: number
  },
) {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: scrollHeight },
    clientHeight: { configurable: true, value: clientHeight },
    scrollTop: {
      configurable: true,
      writable: true,
      value: scrollTop,
    },
  })
}

function runAnimationFrames() {
  act(() => {
    const callbacks = animationFrameCallbacks
    animationFrameCallbacks = []
    callbacks.forEach((callback) => callback(0))
  })
}

beforeEach(() => {
  animationFrameCallbacks = []
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      animationFrameCallbacks.push(callback)
      return animationFrameCallbacks.length
    }),
  )
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('MessageList', () => {
  it('renders an empty state', () => {
    render(<MessageList messages={[]} currentAuthor="Ada" />)

    expect(screen.getByText('No messages yet')).toBeInTheDocument()
    expect(screen.getByText('Start the conversation.')).toBeInTheDocument()
  })

  it('renders multiple messages in the chat history', () => {
    render(<MessageList messages={messages} currentAuthor="Ada" />)

    expect(
      screen.getByRole('region', { name: 'Chat history' }),
    ).toBeInTheDocument()
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })

  it('scrolls to the bottom on initial load', () => {
    render(<MessageList messages={messages} currentAuthor="Ada" />)
    const history = screen.getByRole('region', {
      name: 'Chat history',
    })
    setScrollLayout(history, {
      scrollHeight: 600,
      clientHeight: 200,
      scrollTop: 0,
    })

    runAnimationFrames()

    expect(history.scrollTop).toBe(600)
  })

  it('scrolls for new messages when the user is near the bottom', () => {
    const { rerender } = render(
      <MessageList
        messages={[messages[0]]}
        currentAuthor="Ada"
      />,
    )
    const history = screen.getByRole('region', {
      name: 'Chat history',
    })
    setScrollLayout(history, {
      scrollHeight: 400,
      clientHeight: 200,
      scrollTop: 200,
    })
    runAnimationFrames()
    setScrollLayout(history, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 200,
    })

    rerender(
      <MessageList messages={messages} currentAuthor="Ada" />,
    )
    runAnimationFrames()

    expect(history.scrollTop).toBe(500)
    expect(
      screen.queryByRole('button', { name: 'New messages' }),
    ).not.toBeInTheDocument()
  })

  it('shows an indicator instead of scrolling for new messages when away from the bottom', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <MessageList
        messages={[messages[0]]}
        currentAuthor="Ada"
      />,
    )
    const history = screen.getByRole('region', {
      name: 'Chat history',
    })
    setScrollLayout(history, {
      scrollHeight: 400,
      clientHeight: 200,
      scrollTop: 200,
    })
    runAnimationFrames()
    history.scrollTop = 20
    fireEvent.scroll(history)
    setScrollLayout(history, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 20,
    })

    rerender(
      <MessageList messages={messages} currentAuthor="Ada" />,
    )

    expect(history.scrollTop).toBe(20)
    const indicator = screen.getByRole('button', {
      name: 'New messages',
    })

    await user.click(indicator)
    runAnimationFrames()

    expect(history.scrollTop).toBe(500)
    expect(indicator).not.toBeInTheDocument()
  })

  it('scrolls for a newly sent own message when away from the bottom', () => {
    const ownMessage: ChatMessage = {
      ...messages[1],
      author: 'Ada',
    }
    const { rerender } = render(
      <MessageList
        messages={[messages[0]]}
        currentAuthor="Ada"
      />,
    )
    const history = screen.getByRole('region', {
      name: 'Chat history',
    })
    setScrollLayout(history, {
      scrollHeight: 400,
      clientHeight: 200,
      scrollTop: 200,
    })
    runAnimationFrames()
    history.scrollTop = 20
    fireEvent.scroll(history)
    setScrollLayout(history, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 20,
    })

    rerender(
      <MessageList
        messages={[messages[0], ownMessage]}
        currentAuthor="Ada"
      />,
    )
    runAnimationFrames()

    expect(history.scrollTop).toBe(500)
    expect(
      screen.queryByRole('button', { name: 'New messages' }),
    ).not.toBeInTheDocument()
  })
})
