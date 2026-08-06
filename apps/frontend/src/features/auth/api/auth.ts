import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authAuthenticate, authRegister } from '#/api/generated/auth/auth'
import type { AuthenticateResponse, AuthTokenResponse } from '#/api/generated/model'
import { clearToken, setToken } from '#/lib/auth-token'

type LoginPayload = { email: string; password: string }

export const useLogin = (options?: UseMutationOptions<AuthenticateResponse, Error, LoginPayload>) => {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    ...rest,
    mutationFn: (payload: LoginPayload) => authAuthenticate('customer', 'emailpass', payload),
    onSuccess: (...args) => {
      const [data] = args
      setToken(data.token)
      onSuccess?.(...args)
    },
  })
}

type RegisterPayload = { firstName: string; lastName: string; email: string; phone?: string; password: string }

export const useRegister = (options?: UseMutationOptions<AuthTokenResponse, Error, RegisterPayload>) => {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    ...rest,
    mutationFn: (payload: RegisterPayload) => authRegister('customer', 'emailpass', payload),
    onSuccess: (...args) => {
      const [data] = args
      setToken(data.token)
      onSuccess?.(...args)
    },
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
