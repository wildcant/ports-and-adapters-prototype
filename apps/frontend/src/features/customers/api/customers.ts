import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createCustomers,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from '#/api/generated/admin/customers/customers'
import type {
  CreateCustomer,
  CustomerDeleteResponse,
  CustomerListResponse,
  CustomerResponse,
  ListCustomersParams,
  UpdateCustomer,
} from '#/api/generated/admin/model'
import { queryClient } from '#/lib/query-client'
import { queryKeysFactory } from '#/lib/query-key-factory'

const CUSTOMERS_QUERY_KEY = 'customers' as const
export const customersQueryKeys = queryKeysFactory(CUSTOMERS_QUERY_KEY)

// --- Query options (for route loaders) ---

export const getCustomersQueryOptions = (query?: ListCustomersParams) => ({
  queryKey: customersQueryKeys.list(query),
  queryFn: () => listCustomers(query),
})

// --- Query hooks ---

export const useCustomer = (
  id: string,
  options?: Omit<UseQueryOptions<CustomerResponse, Error, CustomerResponse>, 'queryFn' | 'queryKey'>,
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => getCustomer(id),
    queryKey: customersQueryKeys.detail(id),
    ...options,
  })
  return { ...data, ...rest }
}

export const useCustomers = (
  query?: ListCustomersParams,
  options?: Omit<UseQueryOptions<CustomerListResponse, Error, CustomerListResponse>, 'queryFn' | 'queryKey'>,
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => listCustomers(query),
    queryKey: customersQueryKeys.list(query),
    ...options,
  })
  return { ...data, ...rest }
}

// --- Mutation hooks ---

export const useCreateCustomer = (options?: UseMutationOptions<CustomerListResponse, Error, CreateCustomer[]>) => {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    ...rest,
    mutationFn: (payload) => createCustomers(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() })
      onSuccess?.(...args)
    },
  })
}

export const useUpdateCustomer = (
  options?: UseMutationOptions<CustomerResponse, Error, { id: string; data?: UpdateCustomer }>,
) => {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    ...rest,
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.detail(variables.id) })
      onSuccess?.(...args)
    },
  })
}

export const useDeleteCustomer = (options?: UseMutationOptions<CustomerDeleteResponse, Error, { id: string }>) => {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => deleteCustomer(id),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.detail(variables.id) })
      onSuccess?.(...args)
    },
  })
}
