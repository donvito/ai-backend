import { OpenAPIHono } from '@hono/zod-openapi'
import { bearerAuth } from 'hono/bearer-auth'
import { secureHeaders } from 'hono/secure-headers'
import { cors } from 'hono/cors'

function initialise(): OpenAPIHono {

    const openaApiHono = new OpenAPIHono()

    let token: string | undefined = undefined;
    try {
        token = configureToken();
    } catch (error) {
        console.error('DEFAULT_ACCESS_TOKEN is not set')
        process.exit(1);
    }

    // Add CORS middleware
    openaApiHono.use('/*', cors({
        origin: configureCors(),
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
        exposeHeaders: ['Content-Length', 'X-Request-Id'],
        maxAge: 3600,
        credentials: true,
    }))

    configureApiSecurity(openaApiHono, token);

    return openaApiHono
}

function configureCors() {
    const envOrigins = process.env.CORS_ALLOWED_ORIGINS
    const defaultOrigins = [
        'http://localhost',
        'http://127.0.0.1',
        'https://localhost',
        'https://127.0.0.1',
    ]

    const allowedOrigins = envOrigins
        ? envOrigins.split(',').map((o) => o.trim()).filter((o) => o.length > 0)
        : defaultOrigins

    return (origin: string | undefined): string | null => {
        if (!origin) {
            return null
        }

        for (const o of allowedOrigins) {
            if (o === '*') {
                return origin
            }

            const escaped = o.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
            const regex = new RegExp('^' + escaped + '$')
            if (regex.test(origin)) {
                return origin
            }
        }

        return null
    }
}

function configureToken(): string {
    const token: string | undefined = process.env.DEFAULT_ACCESS_TOKEN;
    if (!token) {
        throw new Error('DEFAULT_ACCESS_TOKEN is not set')
    }
    return token;
}

function configureApiSecurity(app: OpenAPIHono, token: string) {

    const devMode = process.env.NODE_ENV === 'development'
    console.log('process.env.NODE_ENV', process.env.NODE_ENV)
    console.log('devMode', devMode)

    if (!devMode) {
        app.use(secureHeaders())

        app.use('/*', async (c, next) => {
            const path = c.req.path;
            // Allow public access to /doc, /ui, and /redoc
            if (path === '/' || path === '/api/doc' || path === '/api/ui' || path === '/api/redoc' || path === '/api/hello') {
                await next();
                return;
            }
            return bearerAuth({ token })(c, next);
        })

        // Bearer Auth Middleware - Register the correct security scheme
        app.openAPIRegistry.registerComponent(
            'securitySchemes',
            'BearerAuth',
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        );
    }
}        

export default initialise
