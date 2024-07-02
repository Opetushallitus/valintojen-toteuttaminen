import { CalculationStart } from '@/app/lib/valintalaskentakoostepalvelu';

export enum CalculationInitializationStatus {
  WAITING_FOR_CONFIRMATION,
  STARTED,
  NOT_STARTED,
}

export type Calculation = {
  errorMessage?: string | string[] | null;
  calculatedTime?: Date | number | null;
  runningCalculation?: CalculationStart;
  status?: CalculationInitializationStatus;
};

export const calculationReducer = (
  state: Calculation,
  action: Calculation,
): Calculation => {
  return Object.assign({}, state, action);
};
