import { pointToComma } from '@/lib/common';
import { NDASH } from '@/lib/constants';

export const Range = ({ min, max }: { min?: string; max?: string }) =>
  min || max
    ? `${pointToComma(min) ?? ''}${NDASH}${pointToComma(max) ?? ''}`
    : '';
