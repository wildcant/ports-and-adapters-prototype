import { BaseRepository } from '../../../core/utils/base-repository.js'
import { providerIdentityTable } from '../models/provider-identity.js'

export class ProviderIdentityRepository extends BaseRepository(providerIdentityTable) {}
