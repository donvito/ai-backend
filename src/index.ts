import 'dotenv/config';  
import { serve } from '@hono/node-server'
import initialise from './utils/initialise' 
import configureRoutes from './utils/apiRoutes'
import configureApiDocs from './utils/apiDocs'

const app = initialise()

// Configure the routes
configureRoutes(app)

// Configure the API docs
configureApiDocs(app)

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: Number(port)
})