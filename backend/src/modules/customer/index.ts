import { Module } from '../../core/utils/module.js'
import { Modules } from '../../core/utils/modules-definition.js'
import { customerTable } from './models/customer.js'
import { CustomerRepository } from './repositories/customer.js'
import { CustomerModuleService } from './services/customer-module-service.js'

export default Module(Modules.CUSTOMER, {
  service: CustomerModuleService,
  repositories: {
    customerRepository: CustomerRepository,
  },
  models: [customerTable],
})
