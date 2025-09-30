import { describe, expect, test } from 'vitest';
import {
  canHyvaksyPeruuntunut,
  isKirjeidenMuodostaminenAllowed,
  isSendVastaanottoPostiVisible,
  isValintaesitysJulkaistavissa,
  showHyvaksyPeruuntunut,
} from './sijoittelun-tulokset-utils';
import { Haku, Tila } from '@/lib/kouta/kouta-types';
import { UserPermissions } from '@/lib/permissions';
import { add, sub } from 'date-fns';
import { HaunAsetukset } from './ohjausparametrit/ohjausparametrit-types';
import { ValinnanTila } from './types/sijoittelu-types';

const mockHaku: Haku = {
  oid: 'mock-oid',
  nimi: {
    fi: 'mock-nimi',
  },
  tila: Tila.JULKAISTU,
  alkamisVuosi: 2023,
  alkamisKausiKoodiUri: 'mock-alkamisKausiKoodiUri',
  hakutapaKoodiUri: 'mock-hakutapaKoodiUri',
  kohdejoukkoKoodiUri: 'haunkohdejoukko_mock',
  hakukohteita: 123,
  organisaatioOid: 'mock-organisaatioOid',
};

const KORKEAKOULU_KOHDEJOUKKO = 'haunkohdejoukko_12';

const mockPermissions: UserPermissions = {
  hasOphCRUD: false,
  readOrganizations: [],
  writeOrganizations: [],
  crudOrganizations: [],
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: false,
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

describe('isValintaesitysJulkaistavissa', () => {
  test.each([
    {
      hasOphCrud: true,
      valintaesitysHyvaksytty: undefined,
      result: true,
    },
    {
      hasOphCrud: false,
      kohdejoukko: KORKEAKOULU_KOHDEJOUKKO,
      valintaesitysHyvaksytty: undefined,
      result: true,
    },
    {
      hasOphCrud: false,
      valintaesitysHyvaksytty: sub(new Date(), { days: 1 }),
      result: true,
    },
    {
      hasOphCrud: false,
      valintaesitysHyvaksytty: undefined,
      result: false,
    },
    {
      hasOphCrud: false,
      valintaesitysHyvaksytty: add(new Date(), { days: 1 }),
      result: false,
    },
  ] as Array<{
    hasOphCrud: boolean;
    kohdejoukko?: string;
    valintaesitysHyvaksytty?: Date;
    result: boolean;
  }>)(
    'hasOphCrud = $hasOphCrud, kohdejoukko = $kohdejoukko, valintaesitysHyvaksytty = $valintaesitysHyvaksytty, result = $result',
    async ({ hasOphCrud, kohdejoukko, valintaesitysHyvaksytty, result }) => {
      const permissions = { ...mockPermissions, hasOphCRUD: hasOphCrud };

      const haku = {
        ...mockHaku,
        kohdejoukkoKoodiUri: kohdejoukko ?? mockHaku.kohdejoukkoKoodiUri,
      };

      const haunAsetukset: HaunAsetukset = {
        sijoittelu: true,
        valintaEsityksenHyvaksyminen: valintaesitysHyvaksytty,
      };

      expect(
        isValintaesitysJulkaistavissa(haku, permissions, haunAsetukset),
      ).toBe(result);
    },
  );
});

describe('showHyvaksyPeruuntunut', () => {
  test.each([
    {
      peruuntuneenHyvaksyminenAllowed: true,
      valinnanTila: ValinnanTila.PERUUNTUNUT,
      hyvaksyPeruuntunut: false,
      result: true,
    },
    {
      peruuntuneenHyvaksyminenAllowed: true,
      valinnanTila: ValinnanTila.HYVAKSYTTY,
      hyvaksyPeruuntunut: false,
      result: false,
    },
    {
      peruuntuneenHyvaksyminenAllowed: true,
      valinnanTila: ValinnanTila.HYVAKSYTTY,
      hyvaksyPeruuntunut: true,
      result: true,
    },
    {
      peruuntuneenHyvaksyminenAllowed: true,
      valinnanTila: ValinnanTila.PERUNUT,
      hyvaksyPeruuntunut: true,
      result: false,
    },
    {
      peruuntuneenHyvaksyminenAllowed: false,
      valinnanTila: ValinnanTila.PERUUNTUNUT,
      hyvaksyPeruuntunut: false,
      result: false,
    },
    {
      peruuntuneenHyvaksyminenAllowed: false,
      valinnanTila: ValinnanTila.PERUUNTUNUT,
      hyvaksyPeruuntunut: true,
      result: true,
    },
    {
      peruuntuneenHyvaksyminenAllowed: false,
      valinnanTila: ValinnanTila.HYVAKSYTTY,
      hyvaksyPeruuntunut: true,
      result: true,
    },
    {
      peruuntuneenHyvaksyminenAllowed: false,
      valinnanTila: ValinnanTila.VARASIJALTA_HYVAKSYTTY,
      hyvaksyPeruuntunut: true,
      result: true,
    },
    {
      peruuntuneenHyvaksyminenAllowed: false,
      valinnanTila: ValinnanTila.HYLATTY,
      hyvaksyPeruuntunut: true,
      result: false,
    },
  ] as Array<{
    peruuntuneenHyvaksyminenAllowed: boolean;
    valinnanTila?: ValinnanTila;
    hyvaksyPeruuntunut?: boolean;
    result: boolean;
  }>)(
    'peruuntuneenHyvaksyminenAllowed = $peruuntuneenHyvaksyminenAllowed, valinnanTila = $valinnanTila, hyvaksyPeruuntunut = $hyvaksyPeruuntunut, result = $result',
    async ({
      peruuntuneenHyvaksyminenAllowed,
      valinnanTila,
      hyvaksyPeruuntunut,
      result,
    }) => {
      expect(
        showHyvaksyPeruuntunut(
          { valinnanTila, hyvaksyPeruuntunut },
          peruuntuneenHyvaksyminenAllowed,
        ),
      ).toBe(result);
    },
  );
});

describe('canHyvaksyPeruuntunut', () => {
  test.each([
    {
      peruuntuneenHyvaksyminenAllowed: true,
      julkaistavissa: false,
      result: true,
    },
    {
      peruuntuneenHyvaksyminenAllowed: true,
      julkaistavissa: true,
      result: false,
    },
    {
      peruuntuneenHyvaksyminenAllowed: false,
      julkaistavissa: true,
      result: false,
    },
    {
      peruuntuneenHyvaksyminenAllowed: false,
      julkaistavissa: false,
      result: false,
    },
  ] as Array<{
    peruuntuneenHyvaksyminenAllowed: boolean;
    julkaistavissa?: boolean;
    result: boolean;
  }>)(
    'peruuntuneenHyvaksyminenAllowed = $peruuntuneenHyvaksyminenAllowed, valinnanTila = $valinnanTila, julkaistavissa = $julkaistavissa, result = $result',
    async ({ peruuntuneenHyvaksyminenAllowed, julkaistavissa, result }) => {
      expect(
        canHyvaksyPeruuntunut(
          { julkaistavissa },
          peruuntuneenHyvaksyminenAllowed,
        ),
      ).toBe(result);
    },
  );
});
