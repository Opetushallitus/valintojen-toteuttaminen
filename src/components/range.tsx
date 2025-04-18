import { NDASH } from '@/lib/constants';

export const Range = ({
  min,
  max,
}: {
  min?: number | string;
  max?: number | string;
}) => (min || max ? `${min ?? ''}${NDASH}${max ?? ''}` : '');
