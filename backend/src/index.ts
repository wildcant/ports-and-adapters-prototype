import { join } from 'node:path'
import { container } from './container.js'
import { generateDocument } from './openapi/registry.js'
import { loadRoutes } from './routes-loader.js'
import { createApp } from './server/app.js'
import { serveExpress } from './server/platforms.js'

// ---- App (universal, no framework dependency) ----

const app = createApp({ container })

// ---- File-based routing ----

console.log('\nRegistering routes:\n')
await loadRoutes(app, join(import.meta.dirname, 'api'))

// ---- OpenAPI ----

app.addRoute('GET', '/openapi.json', async () => ({
  status: 200,
  json: generateDocument(),
}))

// ---- Platform: Node.js ----

serveExpress(app, 3000, () => {
  console.log('\nServer running at http://localhost:3000\n')
  console.log('Try:')
  console.log('  curl http://localhost:3000/identity')
  console.log(
    '  curl -X POST -H "Content-Type: application/json" -d \'{"name":"Alice","email":"alice@example.com"}\' http://localhost:3000/identity',
  )
  console.log('  curl http://localhost:3000/identity/<id>')
  console.log(
    '  curl -X PATCH -H "Content-Type: application/json" -d \'{"name":"Alicia"}\' http://localhost:3000/identity/<id>',
  )
  console.log('  curl -X DELETE http://localhost:3000/identity/<id>')
  console.log('')
})
