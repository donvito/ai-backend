import { OpenAPIHono } from '@hono/zod-openapi'
import { bearerAuth } from 'hono/bearer-auth'
import { secureHeaders } from 'hono/secure-headers'
import { cors } from 'hono/cors'
import { Context } from 'hono'

function initialise(): OpenAPIHono {

    const openApiHono = new OpenAPIHono()

    const token = configureToken();

    // Add CORS middleware
    openApiHono.use('/*', cors({
        origin: (origin: string | undefined) => {
            // Allow requests from webcontainer-api.io domains
            if (origin && origin.match(/.*\.local-credentialless\.webcontainer-api\.io$/)) {
                return origin;
            }
            return null;
        },
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
        exposeHeaders: ['Content-Length', 'X-Request-Id'],
        maxAge: 3600,
        credentials: true,
    }))

    configureApiSecurity(openApiHono, token);

    return openApiHono
}

function configureToken(): string {
    const envToken: string | undefined = process.env.DEFAULT_ACCESS_TOKEN;
    if (!envToken && process.env.NODE_ENV === 'development') {
        // Provide a predictable token in dev to avoid startup failures
        console.warn('[WARN] DEFAULT_ACCESS_TOKEN not set – using fallback dev token');
        return 'dev-token';
    }
    if (!envToken) {
        throw new Error('DEFAULT_ACCESS_TOKEN is not set');
    }
    return envToken;
}

function configureApiSecurity(app: OpenAPIHono, token: string) {

    const devMode = process.env.NODE_ENV === 'development'

    if (!devMode) {
        app.use(secureHeaders())

        app.use('/*', async (c: Context, next: () => Promise<void>) => {
            const path = c.req.path;
            // Allow public access to /doc, /ui, and /redoc
            if (path === '/' || path === '/api/doc' || path === '/api/ui' || path === '/api/redoc' || path === '/api/hello') {
                await next();
                return;
            }
            return bearerAuth({ token })(c, next);
        })

        // API Key Middleware
        // We should also document this security scheme
        app.openAPIRegistry.registerComponent(
            'securitySchemes',
            'ApiKeyAuth',
            {
                type: 'apiKey',
                name: 'x-api-key',
                in: 'header',
            }
        );
    }
}        

export default initialise