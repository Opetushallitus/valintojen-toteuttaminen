import { expect, test } from 'vitest';
import { byProp, getSortParts } from './table-utils';
import { TranslatedName } from '@/lib/localization/localization-types';

const EMPTY_RESULT = {
  orderBy: undefined,
  direction: undefined,
};

const DATA_TO_SORT = [
  { name: 'Kreivi Dacula', title: { fi: 'Kreivi' }, age: 500 },
  { name: 'Ruhtinas Nukettaja', title: { fi: 'Ruhtinas' }, age: 30 },
  { name: 'Hui Kauhistus', title: { fi: '' }, age: 9999 },
];

const translateEntity = (entity: TranslatedName) => entity.fi ?? '';

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

test('sort byProp being string', () => {
  expect(DATA_TO_SORT.sort(byProp('name', 'asc', translateEntity))).toEqual([
    { name: 'Hui Kauhistus', title: { fi: '' }, age: 9999 },
    { name: 'Kreivi Dacula', title: { fi: 'Kreivi' }, age: 500 },
    { name: 'Ruhtinas Nukettaja', title: { fi: 'Ruhtinas' }, age: 30 },
  ]);

  expect(DATA_TO_SORT.sort(byProp('name', 'desc', translateEntity))).toEqual([
    { name: 'Ruhtinas Nukettaja', title: { fi: 'Ruhtinas' }, age: 30 },
    { name: 'Kreivi Dacula', title: { fi: 'Kreivi' }, age: 500 },
    { name: 'Hui Kauhistus', title: { fi: '' }, age: 9999 },
  ]);
});

test('sort byProp with translated names', () => {
  expect(DATA_TO_SORT.sort(byProp('title', 'asc', translateEntity))).toEqual([
    { name: 'Kreivi Dacula', title: { fi: 'Kreivi' }, age: 500 },
    { name: 'Ruhtinas Nukettaja', title: { fi: 'Ruhtinas' }, age: 30 },
    { name: 'Hui Kauhistus', title: { fi: '' }, age: 9999 },
  ]);

  expect(DATA_TO_SORT.sort(byProp('title', 'desc', translateEntity))).toEqual([
    { name: 'Ruhtinas Nukettaja', title: { fi: 'Ruhtinas' }, age: 30 },
    { name: 'Kreivi Dacula', title: { fi: 'Kreivi' }, age: 500 },
    { name: 'Hui Kauhistus', title: { fi: '' }, age: 9999 },
  ]);
});

test('sort byProp with number', () => {
  expect(DATA_TO_SORT.sort(byProp('age', 'asc', translateEntity))).toEqual([
    { name: 'Ruhtinas Nukettaja', title: { fi: 'Ruhtinas' }, age: 30 },
    { name: 'Kreivi Dacula', title: { fi: 'Kreivi' }, age: 500 },
    { name: 'Hui Kauhistus', title: { fi: '' }, age: 9999 },
  ]);

  expect(DATA_TO_SORT.sort(byProp('age', 'desc', translateEntity))).toEqual([
    { name: 'Hui Kauhistus', title: { fi: '' }, age: 9999 },
    { name: 'Kreivi Dacula', title: { fi: 'Kreivi' }, age: 500 },
    { name: 'Ruhtinas Nukettaja', title: { fi: 'Ruhtinas' }, age: 30 },
  ]);
});
