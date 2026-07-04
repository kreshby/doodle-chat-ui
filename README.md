# Doodle Chat UI

A React + TypeScript implementation of the Doodle frontend chat challenge.

## Tech stack

- Vite
- React
- TypeScript
- TanStack Query
- Zod
- CSS Modules
- Vitest
- React Testing Library

## Requirements

- Node.js 20+
- npm
- Docker, for the official backend

## Backend

The backend is not included in this repository. Clone and run it separately:

```bash
git clone https://github.com/DoodleScheduling/frontend-challenge-chat-api
cd frontend-challenge-chat-api
docker compose up
```

Check that the backend is running:

```bash
curl http://localhost:3000/health
```

Swagger documentation is available at:

```txt
http://localhost:3000/api/v1/docs
```

By default, the frontend expects the API at
`http://localhost:3000/api/v1`.

## Frontend setup

Install the dependencies:

```bash
npm install
```

Optionally copy the example environment file to override the API defaults:

```bash
cp .env.example .env
```

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TOKEN=super-secret-doodle-token
```

The token belongs to the challenge API. It is visible in the browser and
should not be treated as production-grade authentication.

Start the development server:

```bash
npm run dev
```

The frontend is available at `http://localhost:5173` by default.

## Available commands

```bash
npm run dev         # Start the development server
npm test            # Run the test suite once
npm run test:watch  # Run tests in watch mode
npm run lint        # Run ESLint
npm run typecheck   # Run the TypeScript compiler
npm run build       # Type-check and create a production build
npm run preview     # Preview the production build
```

## Project structure

```txt
src/
  app/                     Application entry and providers
  features/chat/api        Message API types, schemas, and API calls
  features/chat/hooks      Chat data hooks, author state, and scroll behavior
  features/chat/components Chat UI components
  features/chat/utils      Formatting, validation, sorting, and merge helpers
  shared/api                Shared HTTP client and API error type
  shared/config             Environment config
  shared/ui                 Reusable UI primitives
```

Chat-specific code is kept under `features/chat`. Generic infrastructure is
kept under `shared`.

## Implementation notes

### Loading and polling

The initial request loads the latest page with
`before=<current timestamp>&limit=50` because plain `GET /messages` returns the
oldest page. The backend does not provide WebSocket or SSE updates, so the
client polls every three seconds with
`after=<latest createdAt with 1ms overlap>&limit=50`.

Incoming messages are merged by `_id` to remove duplicates, then sorted by
`createdAt` and `_id` for deterministic ordering.

### Sending messages

Messages are sent with `POST /messages`. Sending is not optimistic because the
endpoint is not idempotent; the server response is added to the query cache
after a successful request.

### Author persistence

The current author is stored in `localStorage` and restored when the app is
opened again.

### Scrolling

- The initial load scrolls to the latest message.
- A successfully sent message scrolls into view.
- Polled messages scroll into view only when the user is near the bottom.
- Otherwise, a **New messages** button is shown.

### Message rendering

Message content is rendered as plain text, not HTML.

## Accessibility

- Author and message inputs have labels.
- The composer supports keyboard usage: Enter sends, Shift+Enter inserts a
  newline.
- Loading and error states use appropriate roles.
- Load errors include a retry action.
- Focus states are visible.
- The **New messages** control is a button and can be used from the keyboard.

## Testing

Tests do not call the real backend.

Covered areas:

- Zod schema validation
- API client behavior with mocked `fetch`
- message sorting and merging
- current author persistence
- message loading and polling hooks
- message sending
- component states
- auto-scroll behavior

## Known limitations

- No older-message pagination.
- No optimistic updates, because the backend does not provide idempotency keys.
- No WebSocket/SSE support, because the backend exposes only HTTP endpoints.
- No avatars or participant list.
- No E2E tests.
- No virtualization for very large message lists.
