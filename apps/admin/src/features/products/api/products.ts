import { keepPreviousData, queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import type { AdminCreateProduct, AdminUpdateProduct, ListProductsParams } from '#/api/generated/model'
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '#/api/generated/products/products'
import { queryClient } from '#/lib/query-client'
import { queryKeysFactory } from '#/lib/query-key-factory'

const productKeys = queryKeysFactory<'products', ListProductsParams>('products')

export const productsListQueryOptions = (params?: ListProductsParams) =>
  queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    placeholderData: keepPreviousData,
  })

export const productQueryOptions = (id: string) =>
  queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
  })

export const useProducts = (params?: ListProductsParams) => useQuery(productsListQueryOptions(params))

export const useProduct = (id: string) => useQuery(productQueryOptions(id))

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (data: AdminCreateProduct) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export const useUpdateProduct = (id: string) => {
  return useMutation({
    mutationFn: (data: AdminUpdateProduct) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export const useDeleteProduct = (id: string) => {
  return useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
