import { useState } from 'react'
import { useCustomers } from '#/features/customers/api/customers'

const PAGE_SIZE = 5

export function useCustomerList() {
  const [offset, setOffset] = useState(0)
  const { customers = [], count = 0, limit = PAGE_SIZE } = useCustomers({ limit: PAGE_SIZE, offset })

  const [editingId, setEditingId] = useState<string | null>(null)

  return {
    customers,
    count,
    limit,
    offset,
    setOffset,
    editingId,
    setEditingId,
  }
}
