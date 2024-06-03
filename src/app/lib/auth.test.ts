import { expect, test } from 'vitest';
import { RightToOrganization, getOrgsForRight } from './auth';

const rights: RightToOrganization[] = [
  { organizationOid: 'readonly', rights: ['READ'] },
  { organizationOid: 'writeonly', rights: ['WRITE'] },
  { organizationOid: 'crudonly', rights: ['CRUD'] },
  { organizationOid: 'all', rights: ['READ', 'CRUD', 'WRITE'] },
  { organizationOid: 'writenread', rights: ['READ', 'WRITE'] },
];

test('returns organization oids allowed to read', () => {
  expect(getOrgsForRight(rights, 'READ')).toStrictEqual([
    'readonly',
    'writeonly',
    'crudonly',
    'all',
    'writenread',
  ]);
});

test('returns organization oids allowed to write', () => {
  expect(getOrgsForRight(rights, 'WRITE')).toStrictEqual([
    'writeonly',
    'crudonly',
    'all',
    'writenread',
  ]);
});

test('returns organization oids allowed to crud', () => {
  expect(getOrgsForRight(rights, 'CRUD')).toStrictEqual(['crudonly', 'all']);
});
