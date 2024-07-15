import { LaskentaStart } from '@/app/lib/valintalaskentakoostepalvelu';

export type Laskenta = {
  errorMessage?: string | string[] | null;
  calculatedTime?: Date | number | null;
  runningLaskenta?: LaskentaStart;
};

export const laskentaReducer = (
  state: Laskenta,
  action: Laskenta,
): Laskenta => {
  return Object.assign({}, state, action);
};
