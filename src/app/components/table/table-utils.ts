import {
  Language,
  TranslatedName,
} from '@/app/lib/localization/localization-types';
import {
  isTranslatedName,
  translateName,
} from '@/app/lib/localization/translation-utils';

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
    const aProp = isTranslatedName(aKey) ? translateName(aKey, lng) : aKey;

    const bKey = b[key] ?? '';
    const bProp = isTranslatedName(bKey) ? translateName(bKey, lng) : bKey;

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
