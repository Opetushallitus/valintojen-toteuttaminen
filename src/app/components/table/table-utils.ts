import {
  Language,
  TranslatedName,
  getTranslation,
  isTranslatedName,
} from '@/app/lib/common';

export const byProp = <
  T extends Record<string, string | number | TranslatedName | undefined>,
>(
  key: string,
  direction: 'asc' | 'desc' = 'asc',
  lng: Language,
) => {
  const asc = direction === 'asc';
  return (a: T, b: T) => {
    const aKey = a[key] ?? '';
    const aProp = isTranslatedName(aKey) ? getTranslation(aKey, lng) : aKey;

    const bKey = b[key] ?? '';
    const bProp = isTranslatedName(bKey) ? getTranslation(bKey, lng) : bKey;

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
      direction: 'asc' | 'desc';
    };
  }
  return {
    orderBy: undefined,
    direction: undefined,
  };
};
