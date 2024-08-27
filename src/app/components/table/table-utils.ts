import { TranslatedName } from '@/app/lib/localization/localization-types';
import { isTranslatedName } from '@/app/lib/localization/translation-utils';

export type SortDirection = 'asc' | 'desc';

export const byProp = <
  T extends Record<
    string,
    string | number | TranslatedName | boolean | undefined | object
  >,
>(
  key: string,
  direction: SortDirection = 'asc',
  translateEntity: (entity: TranslatedName) => string,
) => {
  const asc = direction === 'asc';
  return (a: T, b: T) => {
    const aKey = a[key] ?? '';
    const aProp = isTranslatedName(aKey) ? translateEntity(aKey) : aKey;

    const bKey = b[key] ?? '';
    const bProp = isTranslatedName(bKey) ? translateEntity(bKey) : bKey;

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
