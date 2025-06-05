import { beforeAll, describe, expect, test } from 'vitest';
import {
  PermissionsResponseData,
  UserPermissions,
  VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
  selectUserPermissions,
} from './permissions';

const MUU_PALVELU_SERVICE_KEY = 'muu-palvelu';

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
      organisaatioOid: 'read_valintaperusteet',
      kayttooikeudet: [{ palvelu: MUU_PALVELU_SERVICE_KEY, oikeus: 'READ' }],
    },
  ],
};

describe('selectUserPermissions', () => {
  let userPermissions: UserPermissions;
  beforeAll(() => {
    userPermissions =
      selectUserPermissions(permissionsResponse)[
        VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY
      ];
  });

  test('valintojentoteuttaminen permission', () => {
    expect(userPermissions.crudOrganizations).toEqual(['crud']);
    expect(userPermissions.writeOrganizations).toEqual(
      expect.arrayContaining(['readwrite', 'crud']),
    );
    expect(userPermissions.readOrganizations).toEqual(
      expect.arrayContaining(['crud', 'readwrite', 'read']),
    );
  });

  test('valintaperusteet permission', () => {
    const valintaperusteetUserPermissions =
      selectUserPermissions(permissionsResponse)[MUU_PALVELU_SERVICE_KEY];

    expect(valintaperusteetUserPermissions.crudOrganizations).toEqual([]);
    expect(valintaperusteetUserPermissions.writeOrganizations).toEqual([]);
    expect(valintaperusteetUserPermissions.readOrganizations).toEqual(
      expect.arrayContaining(['read_valintaperusteet']),
    );
  });
});
