import { BaseRepository } from '../../../core/utils/base-repository.js'
import { captureTable } from '../models/capture.js'

export class CaptureRepository extends BaseRepository(captureTable) {}
