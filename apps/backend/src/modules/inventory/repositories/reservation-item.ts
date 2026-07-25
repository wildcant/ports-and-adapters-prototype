import { BaseRepository } from '../../../core/utils/base-repository.js'
import { reservationItemTable } from '../models/reservation-item.js'

export class ReservationItemRepository extends BaseRepository(reservationItemTable) {}
