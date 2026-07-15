import { createContainer } from "awilix"
import { join } from "path"
import { registerIdentityModule } from "./modules/identity/index.js"
import { loadRoutes } from "./routes-loader.js"
import { createApp } from "./server/app.js"
import { serveNode } from "./server/platforms.js"

// ---- Container setup ----

const container = createContainer()
registerIdentityModule(container)

// ---- App (universal, no framework dependency) ----

const app = createApp({ container })

// ---- File-based routing ----

console.log("\nRegistering routes:\n")
await loadRoutes(app, join(import.meta.dirname, "api"))

// ---- Platform: Node.js ----

serveNode(app, 3000, () => {
  console.log("\nServer running at http://localhost:3000\n")
  console.log("Try:")
  console.log("  curl http://localhost:3000/identity")
  console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"Alice","email":"alice@example.com"}\' http://localhost:3000/identity')
  console.log("  curl http://localhost:3000/identity/<id>")
  console.log('  curl -X PATCH -H "Content-Type: application/json" -d \'{"name":"Alicia"}\' http://localhost:3000/identity/<id>')
  console.log("  curl -X DELETE http://localhost:3000/identity/<id>")
  console.log("")
})
