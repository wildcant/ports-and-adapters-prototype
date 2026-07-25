import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CreateAccountHolderInput,
  CreateAccountHolderOutput,
  DeleteAccountHolderInput,
  DeleteAccountHolderOutput,
  DeletePaymentInput,
  DeletePaymentMethodInput,
  DeletePaymentMethodOutput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ListPaymentMethodsInput,
  ListPaymentMethodsOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  SavePaymentMethodInput,
  SavePaymentMethodOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from './mutations.js'

export interface IPaymentProvider {
  getIdentifier(): string

  // Core payment lifecycle
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput>
  authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput>
  capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput>
  cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput>
  deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput>
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput>
  retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput>
  updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput>
  getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput>

  // Webhooks
  getWebhookActionAndData(data: ProviderWebhookPayload['payload']): Promise<WebhookActionResult>

  // Account holders (optional)
  createAccountHolder?(input: CreateAccountHolderInput): Promise<CreateAccountHolderOutput>
  deleteAccountHolder?(input: DeleteAccountHolderInput): Promise<DeleteAccountHolderOutput>

  // Saved payment methods (optional)
  listPaymentMethods?(input: ListPaymentMethodsInput): Promise<ListPaymentMethodsOutput>
  savePaymentMethod?(input: SavePaymentMethodInput): Promise<SavePaymentMethodOutput>
  deletePaymentMethod?(input: DeletePaymentMethodInput): Promise<DeletePaymentMethodOutput>
}
