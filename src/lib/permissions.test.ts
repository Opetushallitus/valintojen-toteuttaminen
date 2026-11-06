import { describe, expect, it, test } from 'vitest';
import {
  checkHasPermission,
  expandUserPermissions,
  HakuPermissions,
  EMPTY_USER_PERMISSIONS,
  EMPTY_HAKUKOHDERYHMA_PERMISSIONS,
  checkHasHakukohdePermission,
  PermissionsResponseData,
  PERUUNTUNEIDEN_HYVAKSYNTA_PERMISSION_KEY,
  selectUserPermissions,
  SIJOITTELU_SERVICE_KEY,
  UserPermissions,
  VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
} from './permissions';

const OPH_ORGANIZATION_OID = '1.2.246.562.10.00000000001';

const permissionsResponse: PermissionsResponseData = {
  organisaatiot: [
    {
      organisaatioOid: 'crud',
      kayttooikeudet: [
        { palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY, oikeus: 'CRUD' },
        {
          palvelu: SIJOITTELU_SERVICE_KEY,
          oikeus: PERUUNTUNEIDEN_HYVAKSYNTA_PERMISSION_KEY,
        },
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
  ],
};

const DEFAULT_USER_PERMISSIONS = selectUserPermissions(permissionsResponse)!;

const OPH_USER_PERMISSIONS = {
  readOrganizations: [OPH_ORGANIZATION_OID],
  writeOrganizations: [OPH_ORGANIZATION_OID],
  crudOrganizations: [OPH_ORGANIZATION_OID],
  hasOphCRUD: true,
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: true,
};

const EMPTY_PERMISSIONS: UserPermissions = {
  crudOrganizations: [],
  writeOrganizations: [],
  readOrganizations: [],
  hasOphCRUD: false,
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: false,
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
    expect(
      DEFAULT_USER_PERMISSIONS.sijoitteluPeruuntuneidenHyvaksyntaAllowed,
    ).toBeFalsy();
  });

  test('does not have permission to sijoitteluPeruuntuneidenHyvaksynta if not OPH_ORG', () => {
    expect(
      DEFAULT_USER_PERMISSIONS.sijoitteluPeruuntuneidenHyvaksyntaAllowed,
    ).toBeFalsy();
  });

  test('has permission to sijoitteluPeruuntuneidenHyvaksynta when OPH_ORG', () => {
    const response = {
      organisaatiot: [
        {
          organisaatioOid: OPH_ORGANIZATION_OID,
          kayttooikeudet: [
            { palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY, oikeus: 'CRUD' },
            {
              palvelu: SIJOITTELU_SERVICE_KEY,
              oikeus: PERUUNTUNEIDEN_HYVAKSYNTA_PERMISSION_KEY,
            },
          ],
        },
      ],
    };
    const permissions = selectUserPermissions(
      response as PermissionsResponseData,
    );
    expect(permissions.sijoitteluPeruuntuneidenHyvaksyntaAllowed).toBeTruthy();
    expect(permissions.hasOphCRUD).toBeTruthy();
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

describe('checkHasHakukohdePermission', () => {
  const hakukohde = { oid: 'kohde', hakuOid: 'haku', tarjoajaOid: 'tarjoaja' };
  const hakuPermissions: HakuPermissions = {
    hakuOid: 'haku',
    userPermissions: expandUserPermissions(EMPTY_USER_PERMISSIONS),
    hakukohderyhmaPermissions: {
      READ: ['kohde'],
      READ_UPDATE: ['kohde'],
      CRUD: [],
    },
  };

  test('ryhmän muokkausoikeus sallii muokkauksen mutta ei CRUD-toimintoja', () => {
    expect(
      checkHasHakukohdePermission(hakukohde, hakuPermissions, 'READ_UPDATE'),
    ).toBe(true);
    expect(
      checkHasHakukohdePermission(hakukohde, hakuPermissions, 'CRUD'),
    ).toBe(false);
  });

  test('pelkkä ryhmän lukuoikeus ei salli muokkausta', () => {
    const permissions = {
      ...hakuPermissions,
      hakukohderyhmaPermissions: {
        ...EMPTY_HAKUKOHDERYHMA_PERMISSIONS,
        READ: ['kohde'],
      },
    };
    expect(checkHasHakukohdePermission(hakukohde, permissions, 'READ')).toBe(
      true,
    );
    expect(
      checkHasHakukohdePermission(hakukohde, permissions, 'READ_UPDATE'),
    ).toBe(false);
  });

  test('toisen haun oikeudet eivät anna pääsyä hakukohteeseen', () => {
    expect(
      checkHasHakukohdePermission(
        { ...hakukohde, hakuOid: 'toinen-haku' },
        hakuPermissions,
        'READ',
      ),
    ).toBe(false);
  });
});

describe('expandUserPermissions', () => {
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
  it('periyttää oikeudet jälkeläisiin mutta ei sisarorganisaatioihin', () => {
    const expanded = expandUserPermissions(
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

  it('säilyttää ryhmäoikeudet mutta poistaa puusta puuttuvat organisaatiot', () => {
    const permissions = {
      ...EMPTY_USER_PERMISSIONS,
      readOrganizations: ['1.2.246.562.28.123', 'puuttuva'],
      writeOrganizations: ['1.2.246.562.28.123'],
      crudOrganizations: ['1.2.246.562.28.123'],
    };
    expect(expandUserPermissions(permissions, hierarchy)).toEqual({
      ...permissions,
      organizationHierarchyIncluded: true,
      readOrganizations: ['1.2.246.562.28.123'],
    });
  });
});
