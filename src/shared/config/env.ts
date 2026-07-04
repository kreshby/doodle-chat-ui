export type Environment = Readonly<{
  apiBaseUrl: string
  apiToken: string
}>

export const env: Environment = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000/api/v1',
  apiToken:
    import.meta.env.VITE_API_TOKEN ||
    'super-secret-doodle-token',
}
