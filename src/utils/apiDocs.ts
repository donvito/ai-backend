import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
import { readFileSync } from 'fs'
import { join } from 'path'

// function getLandingPageHtml() {
//     const templatePath = join(__dirname, '..', 'templates', 'landing.html')
//     return readFileSync(templatePath, 'utf-8')
// }

function configureApiDocs(app: OpenAPIHono) {
    // The OpenAPI documentation will be available at /doc
    app.doc('/api/doc', {
        openapi: '3.1.0',
        info: {
            title: 'AI Backend',
            version: 'v1.0.0',
            description: 'Making common AI use cases easily accessible and customizable. Skip the heavy lifting of understanding OpenAI or other providers with our open source stack.'
        },
    })

    // The Swagger UI will be available at /ui
    app.get('/api/ui', swaggerUI({ url: '/api/doc' }))

    // Root page with links to documentation
    // app.get('/', (c) => c.html(getLandingPageHtml()))
}

export default configureApiDocs
