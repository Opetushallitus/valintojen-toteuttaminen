import { describe, expect, test } from 'vitest';
import {
  checkHasPermission,
  PermissionsResponseData,
  selectUserPermissions,
  UserPermissions,
  VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
} from './permissions';

const MUU_PALVELU_SERVICE_KEY = 'muu-palvelu';
const OPH_ORGANIZATION_OID = '1.2.246.562.10.00000000001';

const permissionsResponse: PermissionsResponseData = {
  organisaatiot: [
    {
      organisaatioOid: 'crud',
      kayttooikeudet: [
        { palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY, oikeus: 'CRUD' },
      ],
    },
    {
      organisaatioOid: 'readwrite',
      kayttooikeudet: [
        {
          palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
          oikeus: 'READ_UPDATE',
        },
      ],
    },
    {
      organisaatioOid: 'read',
      kayttooikeudet: [
        { palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY, oikeus: 'READ' },
      ],
    },
    {
      organisaatioOid: 'read_muu',
      kayttooikeudet: [{ palvelu: MUU_PALVELU_SERVICE_KEY, oikeus: 'READ' }],
    },
  ],
};

const DEFAULT_USER_PERMISSIONS =
  selectUserPermissions(permissionsResponse)[
    VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY
  ]!;

const OPH_USER_PERMISSIONS = {
  readOrganizations: [OPH_ORGANIZATION_OID],
  writeOrganizations: [OPH_ORGANIZATION_OID],
  crudOrganizations: [OPH_ORGANIZATION_OID],
  hasOphCRUD: true,
};

const EMPTY_PERMISSIONS: UserPermissions = {
  crudOrganizations: [],
  writeOrganizations: [],
  readOrganizations: [],
  hasOphCRUD: false,
};

describe('selectUserPermissions', () => {
  test('valintojentoteuttaminen permission', () => {
    expect(DEFAULT_USER_PERMISSIONS.crudOrganizations).toEqual(['crud']);
    expect(DEFAULT_USER_PERMISSIONS.writeOrganizations).toEqual(
      expect.arrayContaining(['readwrite', 'crud']),
    );
    expect(DEFAULT_USER_PERMISSIONS.readOrganizations).toEqual(
      expect.arrayContaining(['crud', 'readwrite', 'read']),
    );
  });

  test('Muu palvelu permission', () => {
    const valintaperusteetUserPermissions =
      selectUserPermissions(permissionsResponse)[MUU_PALVELU_SERVICE_KEY]!;

    expect(valintaperusteetUserPermissions.crudOrganizations).toEqual([]);
    expect(valintaperusteetUserPermissions.writeOrganizations).toEqual([]);
    expect(valintaperusteetUserPermissions.readOrganizations).toEqual(
      expect.arrayContaining(['read_muu']),
    );
  });
});

describe('checkHasPermission', () => {
  test('returns true if user has CRUD permission for given organization', () => {
    expect(checkHasPermission(['crud'], DEFAULT_USER_PERMISSIONS, 'CRUD')).toBe(
      true,
    );
  });

  test('returns false if user does not have CRUD permission for given organization', () => {
    expect(checkHasPermission(['read'], DEFAULT_USER_PERMISSIONS, 'CRUD')).toBe(
      false,
    );
  });

  test('returns true if user has READ_UPDATE permission for given organization', () => {
    expect(
      checkHasPermission('readwrite', DEFAULT_USER_PERMISSIONS, 'READ_UPDATE'),
    ).toBe(true);
  });

  test('returns false if user does not have READ_UPDATE permission for given organization', () => {
    expect(
      checkHasPermission('read', DEFAULT_USER_PERMISSIONS, 'READ_UPDATE'),
    ).toBe(false);
  });

  test('returns true if user has READ permission for given organization', () => {
    expect(checkHasPermission(['read'], DEFAULT_USER_PERMISSIONS, 'READ')).toBe(
      true,
    );
  });

  test('returns false if user does not have READ permission for given organization', () => {
    expect(
      checkHasPermission('nonexistent', DEFAULT_USER_PERMISSIONS, 'READ'),
    ).toBe(false);
  });

  test('returns true if organizationOid is undefined and user has OPH CRUD rights', () => {
    expect(checkHasPermission(undefined, OPH_USER_PERMISSIONS, 'CRUD')).toBe(
      true,
    );
  });

  test('returns false if organizationOids is undefined and user does not have OPH permission', () => {
    expect(checkHasPermission(undefined, EMPTY_PERMISSIONS, 'CRUD')).toBe(
      false,
    );
  });
});
