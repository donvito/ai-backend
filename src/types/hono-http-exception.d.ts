declare module 'hono/http-exception' {
  export class HTTPException extends Error {
    status: number
    getResponse(): Response
  }
}