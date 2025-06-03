import { describe, it, expect } from 'vitest';
import { findBranchOidsFromOrganizationHierarchy } from './organisaatio-service';

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
