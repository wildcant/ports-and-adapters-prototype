import { Module } from '../../core/utils/module.js'
import { Modules } from '../../core/utils/modules-definition.js'
import { CartLineItemRepository } from './repositories/cart-line-item.js'
import { CartRepository } from './repositories/cart.js'
import { CartModuleService } from './services/cart-module-service.js'

export default Module(Modules.CART, {
  service: CartModuleService,
  repositories: {
    cartRepository: CartRepository,
    cartLineItemRepository: CartLineItemRepository,
  },
})
