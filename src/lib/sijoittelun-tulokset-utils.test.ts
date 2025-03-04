import { describe, expect, test } from 'vitest';
import {
  isKirjeidenMuodostaminenAllowed,
  isSendVastaanottoPostiVisible,
} from './sijoittelun-tulokset-utils';
import { Haku, Tila } from '@/lib/kouta/kouta-types';
import { UserPermissions } from '@/lib/permissions';

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

describe('isKirjeidenMuodostaminenAllowed', () => {
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
      kohdejoukko: 'haunkohdejoukko_1',
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

describe('isSendVastaanottoPostiVisible', () => {
  test.each([
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_11',
      result: false,
    },
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_20',
      result: false,
    },
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_17',
      result: false,
    },
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_11',
      result: false,
    },
    {
      hasOphCrud: false,
      kohdejoukko: 'haunkohdejoukko_1',
      result: true,
    },
  ] as Array<{
    hasOphCrud: boolean;
    kohdejoukko: string;
    result: boolean;
  }>)(
    'hasOphCrud = $hasOphCrud, kohdejoukko = $kohdejoukko, result = $result',
    async ({ hasOphCrud, kohdejoukko, result }) => {
      const permissions = { ...mockPermissions, hasOphCRUD: hasOphCrud };

      const haku = {
        ...mockHaku,
        kohdejoukkoKoodiUri: kohdejoukko,
      };
      expect(isSendVastaanottoPostiVisible(haku, permissions)).toBe(result);
    },
  );
});
