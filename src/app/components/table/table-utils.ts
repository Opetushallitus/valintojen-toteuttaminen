import { TranslatedName } from '@/app/lib/localization/localization-types';
import { isTranslatedName } from '@/app/lib/localization/translation-utils';
import { isNullish, pathOr, stringToPath } from 'remeda';

export type SortDirection = 'asc' | 'desc';

type PropValue =
  | string
  | number
  | TranslatedName
  | boolean
  | undefined
  | object
  | null;

export const byProp = <T extends Record<string, PropValue>>(
  key: string,
  direction: SortDirection = 'asc',
  translateEntity: (entity: TranslatedName) => string,
) => {
  const asc = direction === 'asc';
  return (a: T, b: T) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const aKey = pathOr(a, stringToPath(key), '' as any);
    const aProp = isTranslatedName(aKey) ? translateEntity(aKey) : aKey;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const bKey = pathOr(b, stringToPath(key), '' as any);
    const bProp = isTranslatedName(bKey) ? translateEntity(bKey) : bKey;

    // Järjestetään tyhjät arvot aina loppuun
    if (isNullish(aProp) || aProp === '') {
      return 1;
    }
    if (isNullish(bProp) || bProp === '') {
      return -1;
    }

    return aProp > bProp ? (asc ? 1 : -1) : bProp > aProp ? (asc ? -1 : 1) : 0;
  };
};

export const getSortParts = (sortStr?: string, colId?: string) => {
  const [orderBy, direction] = sortStr?.split(':') ?? [];

  if (
    (colId === undefined || colId === orderBy) &&
    (direction === 'asc' || direction === 'desc')
  ) {
    return { orderBy, direction } as {
      orderBy: string;
      direction: SortDirection;
    };
  }
  return {
    orderBy: undefined,
    direction: undefined,
  };
};
