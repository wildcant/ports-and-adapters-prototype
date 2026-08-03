import type { AdminProductVariant } from '#/api/generated/model'
import { useDefineTable } from '#/components/data-table'
import { useProductVariants } from '#/features/products/api/product-variants'

export const useVariantTable = (productId: string) =>
  useDefineTable<AdminProductVariant>({
    useData: (params) => {
      const { data, isPending } = useProductVariants(productId, params)
      return {
        data: data?.variants ?? [],
        count: data?.count,
        isPending,
      }
    },

    columns: (col) => [
      col.accessor('title', { header: 'Title', sortable: true }),
      col.accessor('sku', { header: 'SKU' }),
    ],

    filters: (filter) => [
      filter.accessor('allowBackorder', {
        type: 'radio',
        label: 'Allow Backorder',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      }),
      filter.accessor('manageInventory', {
        type: 'radio',
        label: 'Manage Inventory',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      }),
    ],

    prefix: 'pv',
    pageSize: 10,
    getRowId: (row) => row.id,

    empty: {
      heading: 'No variants yet',
      description: 'Create your first variant to get started.',
    },
    filtered: {
      heading: 'No variants found',
      description: 'Try changing your filters or search term.',
    },
  })
