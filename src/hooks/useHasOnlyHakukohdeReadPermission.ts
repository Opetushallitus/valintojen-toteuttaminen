'use client';
import { createContext, use } from 'react';

export const HakukohdeUseHasReadOnlyContext = createContext<boolean>(true);

export const useHasOnlyHakukohdeReadPermission = () => {
  return use(HakukohdeUseHasReadOnlyContext);
};
