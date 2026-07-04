import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { CreateMessageInput } from '../api/chatTypes'
import { useSendChatMessage } from '../hooks/useSendChatMessage'
import { MessageComposer } from './MessageComposer'

vi.mock('../hooks/useSendChatMessage')

type MockMutation = {
  mutate: (
    input: CreateMessageInput,
    options?: { onSuccess?: () => void },
  ) => void
  isPending: boolean
  isError: boolean
}

const mutate = vi.fn<MockMutation['mutate']>()

function mockMutation(overrides: Partial<MockMutation> = {}) {
  vi.mocked(useSendChatMessage).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useSendChatMessage>)
}

beforeEach(() => {
  vi.clearAllMocks()
  mutate.mockReset()
  mockMutation()
})

afterEach(cleanup)

describe('MessageComposer', () => {
  it('renders a message input and send button', () => {
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)

    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Send' }),
    ).toBeInTheDocument()
  })

  it('disables send for an empty or whitespace-only message', async () => {
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Send' })

    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText('Message'), '   ')

    expect(button).toBeDisabled()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('trims and sends the message with its author', async () => {
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)

    await user.type(
      screen.getByLabelText('Message'),
      '  Hello\nthere  ',
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(mutate).toHaveBeenCalledWith(
      {
        message: 'Hello\nthere',
        author: 'Ada',
      },
      expect.any(Object),
    )
  })

  it('clears and focuses the input after a successful send', async () => {
    mutate.mockImplementation((_input, options) => options?.onSuccess?.())
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)
    const input = screen.getByLabelText('Message')

    await user.type(input, 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('keeps the input value and shows an error after a failed send', async () => {
    mockMutation({ isError: true })
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)
    const input = screen.getByLabelText('Message')

    await user.type(input, 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(input).toHaveValue('Hello')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Message could not be sent. Please try again.',
    )
  })

  it('shows an error and disables send when the message is too long', async () => {
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)

    await user.type(screen.getByLabelText('Message'), 'a'.repeat(501))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Message must be 500 characters or fewer.',
    )
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('submits when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)

    await user.type(screen.getByLabelText('Message'), 'Hello{Enter}')

    expect(mutate).toHaveBeenCalledWith(
      { message: 'Hello', author: 'Ada' },
      expect.any(Object),
    )
  })

  it('inserts a newline without submitting when Shift+Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)
    const input = screen.getByLabelText('Message')

    await user.type(input, 'Hello{Shift>}{Enter}{/Shift}there')

    expect(input).toHaveValue('Hello\nthere')
    expect(mutate).not.toHaveBeenCalled()
  })

  it('supports repeated newlines and submits the full multiline message with Enter', async () => {
    const user = userEvent.setup()
    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)
    const input = screen.getByLabelText('Message')

    await user.type(
      input,
      'First{Shift>}{Enter}{/Shift}Second{Shift>}{Enter}{/Shift}Third',
    )

    expect(input).toHaveValue('First\nSecond\nThird')
    expect(mutate).not.toHaveBeenCalled()

    await user.type(input, '{Enter}')

    expect(mutate).toHaveBeenCalledWith(
      {
        message: 'First\nSecond\nThird',
        author: 'Ada',
      },
      expect.any(Object),
    )
  })

  it('disables submit while sending', () => {
    mockMutation({ isPending: true })

    render(<MessageComposer author="Ada" onChangeAuthor={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Sending…' }),
    ).toBeDisabled()
  })
})
