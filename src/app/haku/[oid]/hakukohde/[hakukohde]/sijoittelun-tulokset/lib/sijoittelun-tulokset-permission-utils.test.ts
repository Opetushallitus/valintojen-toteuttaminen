import { describe, expect, test } from 'vitest';
import { isKirjeidenMuodostaminenAllowed } from './sijoittelun-tulokset-permission-utils';
import { Haku, Tila } from '@/app/lib/types/kouta-types';
import { UserPermissions } from '@/app/lib/permissions';

describe('isKirjeidenMuodostaminenAllowed', () => {
  const mockHaku: Haku = {
    oid: 'mock-oid',
    nimi: {
      fi: 'mock-nimi',
    },
    tila: Tila.JULKAISTU,
    alkamisVuosi: 2023,
    alkamisKausiKoodiUri: 'mock-alkamisKausiKoodiUri',
    hakutapaKoodiUri: 'mock-hakutapaKoodiUri',
    kohdejoukkoKoodiUri: 'haunkohdejoukko_20',
    hakukohteita: 123,
  };

  const mockPermissions: UserPermissions = {
    hasOphCRUD: false,
    readOrganizations: [],
    writeOrganizations: [],
    crudOrganizations: [],
  };

  test.each([
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_11',
      kaikkiJonotHyvaksytty: false,
      result: false,
    },
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_20',
      kaikkiJonotHyvaksytty: false,
      result: false,
    },
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_17',
      kaikkiJonotHyvaksytty: false,
      result: false,
    },
    {
      hasOphCrud: true,
      kohdejoukko: 'haunkohdejoukko_11',
      kaikkiJonotHyvaksytty: false,
      result: true,
    },
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_11',
      kaikkiJonotHyvaksytty: true,
      result: true,
    },
  ] as Array<{
    hasOphCrud: boolean;
    kohdejoukko: string;
    kaikkiJonotHyvaksytty: boolean;
    result: boolean;
  }>)(
    'hasOphCrud = $hasOphCrud, kohdejoukko = $kohdejoukko, kaikkiJonotHyvaksytty = $kaikkiJonotHyvaksytty, result = $result',
    async ({ hasOphCrud, kohdejoukko, kaikkiJonotHyvaksytty, result }) => {
      const permissions = { ...mockPermissions, hasOphCRUD: hasOphCrud };

      const haku = {
        ...mockHaku,
        kohdejoukkoKoodiUri: kohdejoukko,
      };
      expect(
        isKirjeidenMuodostaminenAllowed(
          haku,
          permissions,
          kaikkiJonotHyvaksytty,
        ),
      ).toBe(result);
    },
  );
});
