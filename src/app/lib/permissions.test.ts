import { expect, test } from 'vitest';
import { OrganizationPermissions, getOrgsForPermission } from './permissions';

const rights: OrganizationPermissions[] = [
  { organizationOid: 'readonly', rights: ['READ'] },
  { organizationOid: 'writeonly', rights: ['READ_UPDATE'] },
  { organizationOid: 'crudonly', rights: ['CRUD'] },
  { organizationOid: 'all', rights: ['READ', 'CRUD', 'READ_UPDATE'] },
  { organizationOid: 'writenread', rights: ['READ', 'READ_UPDATE'] },
];

test('returns organization oids allowed to read', () => {
  expect(getOrgsForPermission(rights, 'READ')).toStrictEqual([
    'readonly',
    'writeonly',
    'crudonly',
    'all',
    'writenread',
  ]);
});

test('returns organization oids allowed to write', () => {
  expect(getOrgsForPermission(rights, 'READ_UPDATE')).toStrictEqual([
    'writeonly',
    'crudonly',
    'all',
    'writenread',
  ]);
});

test('returns organization oids allowed to crud', () => {
  expect(getOrgsForPermission(rights, 'CRUD')).toStrictEqual([
    'crudonly',
    'all',
  ]);
});
