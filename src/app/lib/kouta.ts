'use client';

import { configuration } from './configuration';
import { Haku, Hakukohde, Tila } from './kouta-types';
import { client } from './http-client';
import { TranslatedName } from './localization/localization-types';
import { UserPermissions } from './permissions';

const mapToHaku = (h: {
  oid: string;
  nimi: TranslatedName;
  tila: string;
  hakutapaKoodiUri: string;
  hakuvuosi: string;
  hakukausi: string;
  totalHakukohteet: number;
  kohdejoukkoKoodiUri: string;
}) => {
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
  const response = await client.get(`${configuration.hautUrl}${tarjoajaOids}`);
  const haut: Haku[] = response.data.map(mapToHaku);
  return haut;
}

export function isToisenAsteenYhteisHaku(haku: Haku): boolean {
  return (
    haku.hakutapaKoodiUri.startsWith('hakutapa_01') &&
    haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_11')
  );
}

export function isKorkeakouluHaku(haku: Haku): boolean {
  return haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_12');
}

export async function getHaku(oid: string): Promise<Haku> {
  const response = await client.get(`${configuration.hakuUrl}/${oid}`);
  return mapToHaku(response.data);
}

export async function getHakukohteet(
  hakuOid: string,
  userPermissions: UserPermissions,
): Promise<Hakukohde[]> {
  const tarjoajaOids = permissionsToTarjoajat(userPermissions);
  const response = await client.get(
    `${configuration.hakukohteetUrl}&haku=${hakuOid}${tarjoajaOids}`,
  );
  const hakukohteet: Hakukohde[] = response.data.map(
    (h: {
      oid: string;
      nimi: TranslatedName;
      organisaatioOid: string;
      organisaatioNimi: TranslatedName;
      jarjestyspaikkaHierarkiaNimi: TranslatedName;
    }) => {
      return {
        oid: h.oid,
        nimi: h.nimi,
        organisaatioNimi: h.organisaatioNimi,
        organisaatioOid: h.organisaatioOid,
        jarjestyspaikkaHierarkiaNimi: h.jarjestyspaikkaHierarkiaNimi,
      };
    },
  );
  return hakukohteet;
}

export async function getHakukohde(hakukohdeOid: string): Promise<Hakukohde> {
  const response = await client.get(
    `${configuration.hakukohdeUrl}/${hakukohdeOid}`,
  );
  return {
    oid: response.data.oid,
    nimi: response.data.nimi,
    organisaatioNimi: response.data.organisaatioNimi,
    organisaatioOid: response.data.organisaatioOid,
    jarjestyspaikkaHierarkiaNimi: response.data.jarjestyspaikkaHierarkiaNimi,
  };
}
