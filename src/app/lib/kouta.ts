'use client';

import { configuration } from './configuration';
import { Haku, Hakukohde, Tila } from './types/kouta-types';
import { client } from './http-client';
import { TranslatedName } from './localization/localization-types';
import { UserPermissions } from './permissions';
import { pick } from 'remeda';
import { HaunAsetukset } from './types/haun-asetukset';

type HakuResponseData = {
  oid: string;
  nimi: TranslatedName;
  tila: string;
  hakutapaKoodiUri: string;
  hakuvuosi: string;
  hakukausi: string;
  totalHakukohteet: number;
  kohdejoukkoKoodiUri: string;
};

const mapToHaku = (h: HakuResponseData) => {
  const haunTila: Tila = Tila[h.tila.toUpperCase() as keyof typeof Tila];

  return {
    oid: h.oid,
    nimi: h.nimi,
    tila: haunTila,
    hakutapaKoodiUri: h.hakutapaKoodiUri,
    alkamisVuosi: parseInt(h.hakuvuosi),
    alkamisKausiKoodiUri: h.hakukausi,
    hakukohteita: h?.totalHakukohteet ?? 0,
    kohdejoukkoKoodiUri: h.kohdejoukkoKoodiUri,
  };
};

const permissionsToTarjoajat = (userPermissions: UserPermissions): string =>
  userPermissions.admin
    ? ''
    : userPermissions.readOrganizations.reduce(
        (prev, current) => `${prev}&tarjoaja=${current}`,
        '',
      );

export async function getHaut(userPermissions: UserPermissions) {
  const tarjoajaOids = permissionsToTarjoajat(userPermissions);
  const response = await client.get<Array<HakuResponseData>>(
    `${configuration.hautUrl}${tarjoajaOids}`,
  );
  const haut: Array<Haku> = response.data.map(mapToHaku);
  return haut;
}

export const isYhteishaku = (haku: Haku): boolean =>
  haku.hakutapaKoodiUri.startsWith('hakutapa_01');

export const sijoitellaankoHaunHakukohteetLaskennanYhteydessa = (
  haku: Haku,
  haunAsetukset: HaunAsetukset,
): boolean => !(isYhteishaku(haku) || haunAsetukset.sijoittelu);

export function isToisenAsteenYhteisHaku(haku: Haku): boolean {
  return (
    isYhteishaku(haku) &&
    haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_11')
  );
}

export function isKorkeakouluHaku(haku: Haku): boolean {
  return haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_12');
}

export function isHarkinnanvarainenHakukohde(hakukohde: Hakukohde): boolean {
  return hakukohde.voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita;
}

export async function getHaku(oid: string): Promise<Haku> {
  const response = await client.get<HakuResponseData>(
    `${configuration.hakuUrl}/${oid}`,
  );
  return mapToHaku(response.data);
}

type HakukohdeResponseData = {
  oid: string;
  hakuOid: string;
  nimi: TranslatedName;
  organisaatioOid: string;
  organisaatioNimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
  voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: boolean;
};

const mapToHakukohde = (hakukohdeData: HakukohdeResponseData) =>
  pick(hakukohdeData, [
    'oid',
    'hakuOid',
    'nimi',
    'organisaatioOid',
    'organisaatioNimi',
    'jarjestyspaikkaHierarkiaNimi',
    'voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita',
  ]);

export async function getHakukohteet(
  hakuOid: string,
  userPermissions: UserPermissions,
): Promise<Hakukohde[]> {
  const tarjoajaOids = permissionsToTarjoajat(userPermissions);
  const response = await client.get<Array<HakukohdeResponseData>>(
    `${configuration.hakukohteetUrl}&haku=${hakuOid}${tarjoajaOids}`,
  );
  return response.data.map(mapToHakukohde);
}

export const getHakukohteetQueryOptions = (
  hakuOid: string,
  userPermissions: UserPermissions,
) => ({
  queryKey: ['getHakukohteet', hakuOid, userPermissions],
  queryFn: () => getHakukohteet(hakuOid, userPermissions),
});

export async function getHakukohde(hakukohdeOid: string): Promise<Hakukohde> {
  const response = await client.get<HakukohdeResponseData>(
    `${configuration.hakukohdeUrl}/${hakukohdeOid}`,
  );

  return mapToHakukohde(response.data);
}
