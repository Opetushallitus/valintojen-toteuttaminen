import { expect, test } from 'vitest';
import { OrganizationPermissions, getOrgsForPermission } from './permissions';

const permissions: OrganizationPermissions[] = [
  { organizationOid: 'readonly', permissions: ['READ'] },
  { organizationOid: 'writeonly', permissions: ['READ_UPDATE'] },
  { organizationOid: 'crudonly', permissions: ['CRUD'] },
  { organizationOid: 'all', permissions: ['READ', 'CRUD', 'READ_UPDATE'] },
  { organizationOid: 'writenread', permissions: ['READ', 'READ_UPDATE'] },
];

test('returns organization oids allowed to read', () => {
  expect(getOrgsForPermission(permissions, 'READ')).toStrictEqual([
    'readonly',
    'writeonly',
    'crudonly',
    'all',
    'writenread',
  ]);
});

test('returns organization oids allowed to write', () => {
  expect(getOrgsForPermission(permissions, 'READ_UPDATE')).toStrictEqual([
    'writeonly',
    'crudonly',
    'all',
    'writenread',
  ]);
});

test('returns organization oids allowed to crud', () => {
  expect(getOrgsForPermission(permissions, 'CRUD')).toStrictEqual([
    'crudonly',
    'all',
  ]);
});
