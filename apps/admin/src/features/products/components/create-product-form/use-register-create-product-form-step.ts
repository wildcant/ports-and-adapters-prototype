import type { AnyFormGroupApi } from '@tanstack/form-core'
import { useEffect } from 'react'
import type { GroupRefs, Tab } from './constants'

/** Register a FormGroup API in the shared ref map so the parent can validate any step. */
export function useRegisterCreateProductFormStep(groupRefs: GroupRefs, tab: Tab, formGroup: AnyFormGroupApi) {
  useEffect(() => {
    groupRefs.current[tab] = formGroup
    return () => {
      delete groupRefs.current[tab]
    }
  }, [groupRefs, tab, formGroup])
}
