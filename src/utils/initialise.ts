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
        origin: buildOriginEvaluator(),
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

// --- CORS Helpers ---

function buildOriginEvaluator(): (origin: string | null) => string | null {
    const envOrigins = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS;

    // If no env configured, default to allowing localhost variants
    const defaultAllowed = [
        'http://localhost*',
        'http://127.0.0.1*',
        'https://localhost*',
        'https://127.0.0.1*',
    ];

    const patterns = parseAllowedOrigins(envOrigins, defaultAllowed);

    const hasAllowAll = patterns.some((p) => p.type === 'wildcard_all');

    return (origin: string | null): string | null => {
        if (!origin) return null;

        // If '*' present, echo the caller origin to be compatible with credentials=true
        if (hasAllowAll) return origin;

        for (const p of patterns) {
            if (p.type === 'exact' && origin === p.value) return origin;
            if (p.type === 'wildcard' && p.regex!.test(origin)) return origin;
        }
        return null;
    };
}

type OriginPattern =
    | { type: 'exact'; value: string }
    | { type: 'wildcard'; value: string; regex: RegExp }
    | { type: 'wildcard_all' };

function parseAllowedOrigins(envOrigins: string | undefined, fallback: string[]): OriginPattern[] {
    const rawList = (envOrigins && envOrigins.trim().length > 0)
        ? envOrigins
        : fallback.join(',');

    const items = rawList
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const patterns: OriginPattern[] = [];
    for (const item of items) {
        if (item === '*') {
            patterns.push({ type: 'wildcard_all' });
            continue;
        }
        if (item.includes('*')) {
            const regex = wildcardToRegex(item);
            patterns.push({ type: 'wildcard', value: item, regex });
        } else {
            patterns.push({ type: 'exact', value: item });
        }
    }
    return patterns;
}

function wildcardToRegex(pattern: string): RegExp {
    // Escape regex special chars, then replace wildcard '*' with '.*'
    const escaped = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
    return new RegExp('^' + escaped + '$');
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