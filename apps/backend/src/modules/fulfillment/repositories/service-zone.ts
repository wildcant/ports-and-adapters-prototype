import { BaseRepository } from '../../../core/utils/base-repository.js'
import { serviceZoneTable } from '../models/service-zone.js'

export class ServiceZoneRepository extends BaseRepository(serviceZoneTable) {}
