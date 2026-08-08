import { keepPreviousData, queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { acceptInvite, createInvite, deleteInvite, listInvites, resendInvite } from '#/api/generated/invites/invites'
import type { AcceptInviteBody, CreateInviteBody, ListInvitesParams } from '#/api/generated/model'
import { queryClient } from '#/lib/query-client'
import { queryKeysFactory } from '#/lib/query-key-factory'

const inviteKeys = queryKeysFactory<'invites', ListInvitesParams>('invites')

export const invitesListQueryOptions = (params?: ListInvitesParams) =>
  queryOptions({
    queryKey: inviteKeys.list(params),
    queryFn: () => listInvites(params),
    placeholderData: keepPreviousData,
  })

export const useInvites = (params?: ListInvitesParams) => useQuery(invitesListQueryOptions(params))

export const useCreateInvite = () => {
  return useMutation({
    mutationFn: (data: CreateInviteBody) => createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() })
    },
  })
}

export const useDeleteInvite = (id: string) => {
  return useMutation({
    mutationFn: () => deleteInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() })
    },
  })
}

export const useResendInvite = (id: string) => {
  return useMutation({
    mutationFn: () => resendInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() })
    },
  })
}

export const useAcceptInvite = () => {
  return useMutation({
    mutationFn: (data: AcceptInviteBody) => acceptInvite(data),
  })
}
