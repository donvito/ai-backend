import { Context } from 'hono'
// @ts-ignore – Library types may be missing in editor
import { HTTPException } from 'hono/http-exception'

/**
 * Return a safe generic error message for the client
 */
function genericError(c: Context) {
  return c.json({ error: 'Internal server error' }, 500)
}

/**
 * Handle API errors consistently
 */
export function handleError(c: Context, error: unknown, message = 'Internal server error') {
  // Allow predefined HTTPExceptions to propagate with their status code
  if (error instanceof HTTPException) {
    return error.getResponse()
  }

  // Log server-side but avoid leaking sensitive information to the client
  console.error(message, error as any)

  return genericError(c)
}

/**
 * Handle validation errors for required fields
 */
export function handleValidationError(c: Context, field: string) {
  return c.json({ error: `${field} is required` }, 400)
} 