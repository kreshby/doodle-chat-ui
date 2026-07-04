# Doodle Chat UI

React and TypeScript frontend for the Doodle Frontend Challenge. The project
uses Vite, TanStack Query, Zod, Vitest, and React Testing Library.

## Setup

Install dependencies:

```sh
npm install
```

Copy the example environment file if you want to override the defaults:

```sh
cp .env.example .env
```

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TOKEN=super-secret-doodle-token
```

Start the frontend development server:

```sh
npm run dev
```

The backend is a separate application and must be running independently on
`http://localhost:3000`. For example, check its health with:

```sh
curl http://localhost:3000/api/v1/health
```

## Commands

Run the test suite:

```sh
npm test
```

Run tests in watch mode:

```sh
npm run test:watch
```

Type-check the project:

```sh
npm run typecheck
```

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```
