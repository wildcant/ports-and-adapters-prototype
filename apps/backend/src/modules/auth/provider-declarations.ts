import type { AuthModuleOptions } from '../../core/types/auth/provider.js'
import emailpassProvider from '../../providers/auth-emailpass/index.js'

/**
 * Single source of truth for which auth providers are configured.
 * Passed to the auth module at bootstrap time.
 */
export const authProviderDeclarations: AuthModuleOptions = {
  providers: [
    {
      resolve: emailpassProvider,
      id: 'emailpass',
    },
  ],
}
