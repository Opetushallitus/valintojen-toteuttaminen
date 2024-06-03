import { expect, test } from 'vitest';
import { RightToOrganization, getOrgsForRight } from './auth';

const rights: RightToOrganization[] = [
  { organizationOid: 'readonly', rights: ['READ'] },
  { organizationOid: 'writeonly', rights: ['READ_UPDATE'] },
  { organizationOid: 'crudonly', rights: ['CRUD'] },
  { organizationOid: 'all', rights: ['READ', 'CRUD', 'READ_UPDATE'] },
  { organizationOid: 'writenread', rights: ['READ', 'READ_UPDATE'] },
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
  expect(getOrgsForRight(rights, 'READ_UPDATE')).toStrictEqual([
    'writeonly',
    'crudonly',
    'all',
    'writenread',
  ]);
});

test('returns organization oids allowed to crud', () => {
  expect(getOrgsForRight(rights, 'CRUD')).toStrictEqual(['crudonly', 'all']);
});
