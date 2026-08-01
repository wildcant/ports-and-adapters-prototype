import type { BaseFilterable, OperatorMap } from '../common.js'

// ---------------------------------------------------------------------------
// Status enums
// ---------------------------------------------------------------------------

export type PaymentCollectionStatus = 'not_paid' | 'awaiting' | 'authorized' | 'partially_authorized' | 'completed'

export type PaymentSessionStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'requires_more'
  | 'error'
  | 'canceled'
  | 'pending_authorization'

export type PaymentActions =
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'pending'
  | 'requires_more'
  | 'canceled'
  | 'not_supported'
  | 'pending_authorization'

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type PaymentCollectionDTO = {
  id: string
  currencyCode: string
  amount: number
  authorizedAmount: number | null
  capturedAmount: number | null
  refundedAmount: number | null
  completedAt: string | null
  status: PaymentCollectionStatus
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  paymentSessions?: PaymentSessionDTO[]
  payments?: PaymentDTO[]
}

export type PaymentSessionDTO = {
  id: string
  paymentCollectionId: string
  providerId: string
  currencyCode: string
  amount: number
  status: PaymentSessionStatus
  data: Record<string, unknown>
  context: Record<string, unknown> | null
  authorizedAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  payment?: PaymentDTO
}

export type PaymentDTO = {
  id: string
  paymentCollectionId: string
  paymentSessionId: string
  amount: number
  currencyCode: string
  providerId: string
  data: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  capturedAt: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  captures?: CaptureDTO[]
  refunds?: RefundDTO[]
}

export type CaptureDTO = {
  id: string
  paymentId: string
  amount: number
  createdBy: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type RefundDTO = {
  id: string
  paymentId: string
  refundReasonId: string | null
  amount: number
  note: string | null
  createdBy: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type RefundReasonDTO = {
  id: string
  label: string
  code: string
  description: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PaymentProviderDTO = {
  id: string
  isEnabled: boolean
}

export type AccountHolderDTO = {
  id: string
  providerId: string
  externalId: string
  email: string | null
  data: Record<string, unknown>
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PaymentMethodDTO = {
  id: string
  data: Record<string, unknown>
  providerId: string
}

// ---------------------------------------------------------------------------
// Filterable types
// ---------------------------------------------------------------------------

export interface FilterablePaymentCollectionProps extends BaseFilterable<FilterablePaymentCollectionProps> {
  id?: string | string[]
  status?: PaymentCollectionStatus | PaymentCollectionStatus[]
  createdAt?: OperatorMap<string>
  updatedAt?: OperatorMap<string>
}

export interface FilterablePaymentSessionProps extends BaseFilterable<FilterablePaymentSessionProps> {
  id?: string | string[]
  paymentCollectionId?: string | string[]
  providerId?: string | string[]
  status?: PaymentSessionStatus | PaymentSessionStatus[]
  createdAt?: OperatorMap<string>
}

export interface FilterablePaymentProps extends BaseFilterable<FilterablePaymentProps> {
  id?: string | string[]
  paymentCollectionId?: string | string[]
  paymentSessionId?: string | string[]
  providerId?: string | string[]
  createdAt?: OperatorMap<string>
}

export interface FilterableCaptureProps extends BaseFilterable<FilterableCaptureProps> {
  id?: string | string[]
  paymentId?: string | string[]
  createdAt?: OperatorMap<string>
}

export interface FilterableRefundProps extends BaseFilterable<FilterableRefundProps> {
  id?: string | string[]
  paymentId?: string | string[]
  createdAt?: OperatorMap<string>
}

export interface FilterableRefundReasonProps extends BaseFilterable<FilterableRefundReasonProps> {
  id?: string | string[]
  code?: string | string[]
}

export interface FilterablePaymentProviderProps extends BaseFilterable<FilterablePaymentProviderProps> {
  id?: string | string[]
  isEnabled?: boolean
}

export interface FilterablePaymentMethodProps {
  providerId: string
  context: Record<string, unknown>
}
