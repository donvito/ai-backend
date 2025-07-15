import initialise from './utils/initialise' 
import configureRoutes from './utils/apiRoutes'
import configureApiDocs from './utils/apiDocs'

const app = initialise()

// Configure the routes and API docs
async function setup() {
    await configureRoutes(app)
    configureApiDocs(app)
    
    // Start the server
    const port = process.env.PORT || 3000
    console.log(`Starting server on port ${port}...`)
    
    Bun.serve({
        port,
        fetch: app.fetch,
    })
    
    console.log(`Server running on http://localhost:${port}`)
    console.log(`API documentation available at http://localhost:${port}/api/ui`)
}

setup().catch(console.error)

export default app