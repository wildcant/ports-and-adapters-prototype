import { z } from 'zod'
import { StorePaymentCollection, StorePaymentProvider, StorePaymentSession } from './entities.js'

export const StorePaymentProviderListResponse = z
  .object({ paymentProviders: z.array(StorePaymentProvider) })
  .openapi('StorePaymentProviderListResponse')
export type StorePaymentProviderListResponse = z.infer<typeof StorePaymentProviderListResponse>

export const StoreCreatePaymentCollectionResponse = z
  .object({ paymentCollection: StorePaymentCollection })
  .openapi('StoreCreatePaymentCollectionResponse')
export type StoreCreatePaymentCollectionResponse = z.infer<typeof StoreCreatePaymentCollectionResponse>

export const StoreCreatePaymentSessionResponse = z
  .object({ paymentSession: StorePaymentSession })
  .openapi('StoreCreatePaymentSessionResponse')
export type StoreCreatePaymentSessionResponse = z.infer<typeof StoreCreatePaymentSessionResponse>
