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
        origin: (origin) => {
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

    configureApiSecurity(openaApiHono, token);

    return openaApiHono
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