import { TranslatedName } from '@/lib/localization/localization-types';
import { isTranslatedName } from '@/lib/localization/translation-utils';
import { pathOr, pipe, stringToPath, when } from 'remeda';

export type SortDirection = 'asc' | 'desc';

type PropValue =
  | string
  | number
  | TranslatedName
  | boolean
  | undefined
  | object
  | null;

function getValueByPath<R extends Record<string, PropValue>>(
  row: R,
  key: string,
  translateEntity: (entity: TranslatedName) => string,
): PropValue {
  return pipe(
    row,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pathOr(stringToPath(key), '' as any),
    when(isTranslatedName, translateEntity),
  );
}

export const byProp = <R extends Record<string, PropValue>>(
  path: string,
  direction: SortDirection = 'asc',
  translateEntity: (entity: TranslatedName) => string,
) => {
  const asc = direction === 'asc';
  return (a: R, b: R) => {
    const aValue = getValueByPath(a, path, translateEntity) ?? '';
    const bValue = getValueByPath(b, path, translateEntity) ?? '';

    switch (true) {
      case aValue === '':
        // Järjestetään tyhjät arvot aina loppuun
        return 1;
      case bValue === '':
        // Järjestetään tyhjät arvot aina loppuun
        return -1;
      case aValue > bValue:
        return asc ? 1 : -1;
      case aValue < bValue:
        return asc ? -1 : 1;
      default:
        return 0;
    }
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
