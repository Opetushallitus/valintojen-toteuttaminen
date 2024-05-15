import { expect, test } from 'vitest';
import { getSortParts } from './table-utils';

const EMPTY_RESULT = {
  orderBy: undefined,
  direction: undefined,
};

test('getSortParts', () => {
  expect(getSortParts('col:asc', 'col')).toEqual({
    orderBy: 'col',
    direction: 'asc',
  });
  expect(getSortParts('col:asc')).toEqual({
    orderBy: 'col',
    direction: 'asc',
  });
  expect(getSortParts('col:desc', 'col')).toEqual({
    orderBy: 'col',
    direction: 'desc',
  });
  expect(getSortParts('', 'col')).toEqual(EMPTY_RESULT);
  expect(getSortParts(undefined, 'col')).toEqual(EMPTY_RESULT);
});
