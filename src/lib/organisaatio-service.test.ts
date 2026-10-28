import { EMPTY_USER_PERMISSIONS } from './permissions';
import { describe, it, expect } from 'vitest';
import {
  findBranchOidsFromOrganizationHierarchy,
  getHierarchyUserPermissions,
} from './organisaatio-service';

const hierarchy = [
  {
    oid: '1',
    children: [
      {
        oid: '1.1',
        children: [{ oid: '1.1.1' }, { oid: '1.1.2' }],
      },
      {
        oid: '1.2',
        children: [],
      },
    ],
  },
  {
    oid: '2',
    children: [{ oid: '2.1' }],
  },
];

describe('findBranchOidsFromOrganizationHierarchy', () => {
  it('returns empty array if hierarchy is empty', () => {
    expect(findBranchOidsFromOrganizationHierarchy([], ['1'])).toEqual([]);
  });

  it('returns all oids in the branch if a child oid is matched', () => {
    expect(findBranchOidsFromOrganizationHierarchy(hierarchy, ['1.1'])).toEqual(
      ['1.1', '1.1.1', '1.1.2'],
    );
  });

  it('returns all oids for multiple matches', () => {
    expect(
      findBranchOidsFromOrganizationHierarchy(hierarchy, ['1', '2']),
    ).toEqual(['1', '1.1', '1.1.1', '1.1.2', '1.2', '2', '2.1']);
  });

  it('returns only the matched leaf node if it has no children', () => {
    expect(findBranchOidsFromOrganizationHierarchy(hierarchy, ['1.2'])).toEqual(
      ['1.2'],
    );
  });

  it('returns empty array if no oids match', () => {
    expect(
      findBranchOidsFromOrganizationHierarchy(hierarchy, ['non-existent']),
    ).toEqual([]);
  });
});

describe('getHierarchyUserPermissions', () => {
  it('periyttää oikeudet jälkeläisiin mutta ei sisarorganisaatioihin', () => {
    const expanded = getHierarchyUserPermissions(
      {
        ...EMPTY_USER_PERMISSIONS,
        readOrganizations: ['1'],
        writeOrganizations: ['1.1'],
        crudOrganizations: ['1.1.1'],
      },
      hierarchy,
    );
    expect(expanded.readOrganizations).toEqual([
      '1',
      '1.1',
      '1.1.1',
      '1.1.2',
      '1.2',
    ]);
    expect(expanded.writeOrganizations).toEqual(['1.1', '1.1.1', '1.1.2']);
    expect(expanded.crudOrganizations).toEqual(['1.1.1']);
  });

  it('säilyttää ryhmäoikeudet ja puusta puuttuvat suorat oikeudet', () => {
    const permissions = {
      ...EMPTY_USER_PERMISSIONS,
      readOrganizations: ['1.2.246.562.28.123', 'puuttuva'],
      writeOrganizations: ['1.2.246.562.28.123'],
      crudOrganizations: ['1.2.246.562.28.123'],
    };
    expect(getHierarchyUserPermissions(permissions, hierarchy)).toEqual(
      permissions,
    );
  });
});
