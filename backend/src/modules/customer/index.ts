import { Module } from '../../core/utils/module.js'
import { Modules } from '../../core/utils/modules-definition.js'
import { CustomerRepository } from './repositories/customer.js'
import { CustomerAddressRepository } from './repositories/customer-address.js'
import { CustomerModuleService } from './services/customer-module-service.js'

export default Module(Modules.CUSTOMER, {
  service: CustomerModuleService,
  repositories: {
    customerRepository: CustomerRepository,
    customerAddressRepository: CustomerAddressRepository,
  },
})
