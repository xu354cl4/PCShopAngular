// src/app/services/ads-slot-registry.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdsSlotRegistryService {
  // ⚠️ 這三個要對齊你 Position.Code
  readonly TOP = 'top';
  readonly BOTTOM = 'bottom';
  readonly RIGHT_FLOAT = 'right_float';
}
