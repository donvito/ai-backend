import { OpenAPIHono } from "@hono/zod-openapi"
import * as fs from 'fs'
import * as path from 'path'

async function loadRoutes() {
    const routesDir = path.join(__dirname, '../routes')
    const routeFiles = fs.readdirSync(routesDir)
    
    const routes = []
    for (const file of routeFiles) {
        if ((file.endsWith('.ts') || file.endsWith('.js')) &&
            !(file.endsWith('.test.ts') || file.endsWith('.test.js'))) {
            const routePath = path.join(routesDir, file)
            const routeModule = await import(routePath)
            const moduleExport = routeModule.default

            // Handle both new format (with handler/mountPath) and legacy format (direct router)
            const handler = moduleExport?.handler || moduleExport
            const mountPath = moduleExport?.mountPath || file.replace('.ts', '')

            // Only add if handler is a Hono router and its .routes property is an array
            if (handler && typeof handler === 'object' && 
                'routes' in handler && Array.isArray(handler.routes) &&
                typeof handler.fetch === 'function' && typeof handler.route === 'function' // Further check for Hono instance
            ) {
                routes.push({ handler, mountPath })
            } else {
                console.warn(
                  `[WARN] Route file '${file}' (resolved handler type: ${typeof handler}) does not export a valid Hono router instance. Expected an object with an array 'routes' property and fetch/route methods. Skipping.`
                )
                // For debugging, log what the handler actually is if it's not valid
                if (handler && typeof handler === 'object') {
                    console.warn(`[DEBUG] Problematic handler for ${file} has keys: ${Object.keys(handler).join(', ')}. Is routes an array? ${Array.isArray((handler as any).routes)}`);
                }
            }
        }
    }
    return routes
}

async function configureRoutes(app: OpenAPIHono) {
    const routes = await loadRoutes()
    
    // Create a base router for /api
    const apiRouter = new OpenAPIHono()
    
    // Add all routes to the api router
    for (const { handler, mountPath } of routes) {
        apiRouter.route('/' + mountPath, handler)
    }
    
    // Mount the api router to the main app
    app.route('/api', apiRouter)
}

export default configureRoutes