import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import type { ListStoreProductsParams, StoreProductListResponse, StoreProductResponse } from '#/api/generated/model'
import { getStoreProduct, listStoreProducts } from '#/api/generated/products/products'
import { queryKeysFactory } from '#/lib/query-key-factory'

const PRODUCTS_QUERY_KEY = 'products' as const
export const productsQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY)

// --- Query options (for route loaders) ---

export const productsListQueryOptions = (query?: ListStoreProductsParams) => ({
  queryKey: productsQueryKeys.list(query),
  queryFn: () => listStoreProducts(query),
})

export const productQueryOptions = (id: string) => ({
  queryKey: productsQueryKeys.detail(id),
  queryFn: () => getStoreProduct(id),
})

// --- Query hooks ---

export const useProducts = (
  query?: ListStoreProductsParams,
  options?: Omit<UseQueryOptions<StoreProductListResponse, Error, StoreProductListResponse>, 'queryFn' | 'queryKey'>,
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => listStoreProducts(query),
    queryKey: productsQueryKeys.list(query),
    ...options,
  })
  return { ...data, ...rest }
}

export const useProduct = (
  id: string,
  options?: Omit<UseQueryOptions<StoreProductResponse, Error, StoreProductResponse>, 'queryFn' | 'queryKey'>,
) => {
  const { data, ...rest } = useQuery({
    ...productQueryOptions(id),
    ...options,
  })
  return { ...data, ...rest }
}
