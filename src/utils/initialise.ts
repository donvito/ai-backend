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
        origin: configureCORS(),
        allowMethods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept', 'X-Requested-With'],
        exposeHeaders: ['Content-Length', 'X-Request-Id', 'Location'],
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

// --- CORS Helpers ---

function configureCORS(): (origin: string | null) => string | null {
    const raw = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || '').trim();

    const entries = raw.length > 0
        ? raw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    let allowAll = false;

    const regexes: RegExp[] = [];

    if (entries.length === 0) {
        // Strict localhost defaults: http/https, optional port
        regexes.push(/^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i);
    } else {
        for (let p of entries) {
            if (p === '*') {
                allowAll = true;
                continue;
            }
            // Normalize by removing any trailing slashes from provided origins
            p = p.replace(/\/+$/, '');
            // Escape regex special chars except '*', then turn '*' into '.*'
            const escaped = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
            regexes.push(new RegExp('^' + escaped + '$', 'i'));
        }
    }

    return (origin: string | null): string | null => {
        if (!origin) return null;
        if (allowAll) return origin; // Reflect origin for credentials compatibility
        return regexes.some((re) => re.test(origin)) ? origin : null;
    };
}

function configureApiSecurity(app: OpenAPIHono, token: string) {

    const devMode = process.env.NODE_ENV === 'development'
    if (devMode) {
        console.log('process.env.NODE_ENV', process.env.NODE_ENV)
        console.log('devMode', devMode)
    }

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