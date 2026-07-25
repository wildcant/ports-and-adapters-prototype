import { container } from '../src/container.js'
import type {
  IInventoryModuleService,
  ILinkService,
  IProductModuleService,
  IUserModuleService,
} from '../src/core/types/index.js'
import { ContainerRegistrationKeys, Modules } from '../src/core/utils/index.js'

const userService = container.resolve<IUserModuleService>(Modules.USER)
const productService = container.resolve<IProductModuleService>(Modules.PRODUCT)
const inventoryService = container.resolve<IInventoryModuleService>(Modules.INVENTORY)
const linkService = container.resolve<ILinkService>(ContainerRegistrationKeys.LINK)

// --- Users ---
const existingUsers = await userService.listUsers()
if (existingUsers.length === 0) {
  const users = Array.from({ length: 10 }, (_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }))
  const createdUsers = await userService.createUsers(users)
  console.log(`Seeded ${createdUsers.length} users`)
} else {
  console.log(`Skipped users (${existingUsers.length} already exist)`)
}

// --- Products ---
const existingProducts = await productService.listProducts()
if (existingProducts.length > 0) {
  console.log(`Skipped products (${existingProducts.length} already exist)`)
  process.exit(0)
}

const [tshirt, sweatshirt, sweatpants, shorts] = await productService.createProducts([
  {
    title: 'Classic T-Shirt',
    handle: 't-shirt',
    description:
      'Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.',
    status: 'published',
    weight: 400,
    thumbnail: 'https://placehold.co/600x400?text=T-Shirt',
  },
  {
    title: 'Vintage Sweatshirt',
    handle: 'sweatshirt',
    description:
      'Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.',
    status: 'published',
    weight: 400,
    thumbnail: 'https://placehold.co/600x400?text=Sweatshirt',
  },
  {
    title: 'Classic Sweatpants',
    handle: 'sweatpants',
    description:
      'Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.',
    status: 'published',
    weight: 400,
    thumbnail: 'https://placehold.co/600x400?text=Sweatpants',
  },
  {
    title: 'Vintage Shorts',
    handle: 'shorts',
    description:
      'Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.',
    status: 'published',
    weight: 400,
    thumbnail: 'https://placehold.co/600x400?text=Shorts',
  },
])
console.log(`Seeded ${4} products`)

// --- Options ---
const [tshirtSize, tshirtColor] = await productService.createProductOptions([
  { productId: tshirt.id, title: 'Size' },
  { productId: tshirt.id, title: 'Color' },
])
const [sweatshirtSize] = await productService.createProductOptions([{ productId: sweatshirt.id, title: 'Size' }])
const [sweatpantsSize] = await productService.createProductOptions([{ productId: sweatpants.id, title: 'Size' }])
const [shortsSize] = await productService.createProductOptions([{ productId: shorts.id, title: 'Size' }])
console.log('Seeded product options')

// --- Option Values ---
const sizes = ['S', 'M', 'L', 'XL']
const colors = ['Black', 'White']

await productService.createProductOptionValues([
  ...sizes.map((value, i) => ({ optionId: tshirtSize.id, value, rank: i })),
  ...colors.map((value, i) => ({ optionId: tshirtColor.id, value, rank: i })),
  ...sizes.map((value, i) => ({ optionId: sweatshirtSize.id, value, rank: i })),
  ...sizes.map((value, i) => ({ optionId: sweatpantsSize.id, value, rank: i })),
  ...sizes.map((value, i) => ({ optionId: shortsSize.id, value, rank: i })),
])
console.log('Seeded product option values')

// --- Variants ---
const tshirtVariants = sizes.flatMap((size) =>
  colors.map((color) => ({
    productId: tshirt.id,
    title: `${size} / ${color}`,
    sku: `SHIRT-${size}-${color.toUpperCase()}`,
  })),
)

const sweatshirtVariants = sizes.map((size) => ({
  productId: sweatshirt.id,
  title: size,
  sku: `SWEATSHIRT-${size}`,
}))

const sweatpantsVariants = sizes.map((size) => ({
  productId: sweatpants.id,
  title: size,
  sku: `SWEATPANTS-${size}`,
}))

const shortsVariants = sizes.map((size) => ({
  productId: shorts.id,
  title: size,
  sku: `SHORTS-${size}`,
}))

const createdVariants = await productService.createProductVariants([
  ...tshirtVariants,
  ...sweatshirtVariants,
  ...sweatpantsVariants,
  ...shortsVariants,
])
console.log(`Seeded ${createdVariants.length} product variants`)

// --- Images ---
await productService.createProductImages([
  { productId: tshirt.id, url: 'https://placehold.co/600x400?text=T-Shirt+Front', rank: 0 },
  { productId: tshirt.id, url: 'https://placehold.co/600x400?text=T-Shirt+Back', rank: 1 },
  { productId: tshirt.id, url: 'https://placehold.co/600x400?text=T-Shirt+White+Front', rank: 2 },
  { productId: tshirt.id, url: 'https://placehold.co/600x400?text=T-Shirt+White+Back', rank: 3 },
  { productId: sweatshirt.id, url: 'https://placehold.co/600x400?text=Sweatshirt+Front', rank: 0 },
  { productId: sweatshirt.id, url: 'https://placehold.co/600x400?text=Sweatshirt+Back', rank: 1 },
  { productId: sweatpants.id, url: 'https://placehold.co/600x400?text=Sweatpants+Front', rank: 0 },
  { productId: sweatpants.id, url: 'https://placehold.co/600x400?text=Sweatpants+Back', rank: 1 },
  { productId: shorts.id, url: 'https://placehold.co/600x400?text=Shorts+Front', rank: 0 },
  { productId: shorts.id, url: 'https://placehold.co/600x400?text=Shorts+Back', rank: 1 },
])
console.log('Seeded product images')

// --- Inventory Items + Levels + Variant Links ---
const inventoryData = createdVariants.map((v) => ({
  sku: v.sku,
  title: v.title,
  requiresShipping: true,
}))

const createdItems = await inventoryService.createInventoryItems(inventoryData)
console.log(`Seeded ${createdItems.length} inventory items`)

// Create inventory levels (all items at a single default location with stock)
await inventoryService.createInventoryLevels(
  createdItems.map((item) => ({
    inventoryItemId: item.id,
    locationId: 'loc_default',
    stockedQuantity: 100,
    reservedQuantity: 0,
    incomingQuantity: 0,
  })),
)
console.log(`Seeded ${createdItems.length} inventory levels`)

// Link variants -> inventory items (1:1 by matching SKU order)
const links = createdVariants.map((variant, i) => ({
  variantId: variant.id,
  inventoryItemId: createdItems[i].id,
}))
await linkService.repo('productVariantInventoryItem').createMany(links)
console.log(`Seeded ${links.length} variant-inventory links`)

console.log('Done!')
process.exit(0)
