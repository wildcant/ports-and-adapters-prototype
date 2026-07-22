import { container } from '../src/container.js'
import type { IUserModuleService } from '../src/core/types/index.js'
import { Modules } from '../src/core/utils/index.js'

const userService = container.resolve<IUserModuleService>(Modules.USER)

const users = Array.from({ length: 10 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}))

const created = await userService.createUsers(users)
console.log({ created })
console.log(`Seeded ${created.length} users`)
process.exit(0)
