import { queryOptions } from '@tanstack/react-query'
import { getStoreCustomerMe } from '#/api/generated/customers/customers'
import { queryKeysFactory } from '#/lib/query-key-factory'

const CUSTOMERS_QUERY_KEY = 'customers' as const
export const customersQueryKeys = queryKeysFactory(CUSTOMERS_QUERY_KEY)

export const customerMeQueryOptions = () =>
  queryOptions({
    queryKey: customersQueryKeys.detail('me'),
    queryFn: () => getStoreCustomerMe(),
  })
