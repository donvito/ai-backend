import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
import { readFileSync } from 'fs'
import { join } from 'path'
import { Context } from 'hono'
/// <reference types="node" />

function getLandingPageHtml() {
    const templatePath = join(process.cwd(), 'src', 'templates', 'landing.html')
    return readFileSync(templatePath, 'utf-8')
}

function getRedocHtml() {
    const templatePath = join(process.cwd(), 'src', 'templates', 'redoc.html')
    return readFileSync(templatePath, 'utf-8')
}

function configureApiDocs(app: OpenAPIHono) {
    // The OpenAPI documentation will be available at /doc
    app.doc('/api/doc', {
        openapi: '3.1.0',
        info: {
            title: 'AI Backend',
            version: 'v1.0.0',
            description: 'Making common AI use cases easily accessible and customizable. Skip the heavy lifting of understanding OpenAI or other providers with our open source stack.',
            contact: {
                name: 'AI Backend Support',
                url: 'https://github.com/donvito/ai-backend'
            }
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost:3000',
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ]
    })

    // The Swagger UI will be available at /ui
    app.get('/api/ui', swaggerUI({ url: '/api/doc' }))

    // The ReDoc UI will be available at /redoc
    app.get('/api/redoc', (c: Context) => c.html(getRedocHtml()))

    // Root page with links to documentation
    app.get('/', (c: Context) => c.html(getLandingPageHtml()))
}

export default configureApiDocs
