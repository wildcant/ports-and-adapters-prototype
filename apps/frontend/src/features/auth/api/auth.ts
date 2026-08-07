import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  authResetPassword,
  authUpdatePassword,
  authVerificationConfirm,
  storeAuthLogin,
  storeAuthSignup,
} from '#/api/generated/auth/auth'
import type { AuthenticateResponse, ResetPasswordBody, StoreLoginBody, StoreSignupBody } from '#/api/generated/model'
import { clearToken, setToken } from '#/lib/auth-token'

export const useLogin = (options?: UseMutationOptions<AuthenticateResponse, Error, StoreLoginBody>) => {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    ...rest,
    mutationFn: (payload: StoreLoginBody) => storeAuthLogin(payload),
    onSuccess: (...args) => {
      const [data] = args
      setToken(data.token)
      onSuccess?.(...args)
    },
  })
}

export const useRegister = (options?: UseMutationOptions<AuthenticateResponse, Error, StoreSignupBody>) => {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    ...rest,
    mutationFn: (payload: StoreSignupBody) => storeAuthSignup(payload),
    onSuccess: (...args) => {
      const [data] = args
      setToken(data.token)
      onSuccess?.(...args)
    },
  })
}

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordBody) => authResetPassword('customer', 'emailpass', payload),
  })
}

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: ({ password, token }: { password: string; token: string }) => {
      setToken(token)
      return authUpdatePassword('customer', 'emailpass', { password }).finally(() => clearToken())
    },
  })
}

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (payload: { code: string }) => authVerificationConfirm(payload),
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    clearToken()
    queryClient.clear()
    navigate({ to: '/' })
  }
}
