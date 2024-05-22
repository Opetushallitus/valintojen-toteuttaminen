'use client';

import { configuration } from './configuration';
import { Haku, Hakukohde, Tila } from './kouta-types';
import { client } from './http-client';
import { TranslatedName } from './localization/localization-types';

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

export async function getHaut() {
  const response = await client.get(configuration.hautUrl);
  const haut: Haku[] = response.data.map(mapToHaku);
  return haut;
}

export function isToisenAsteenYhteisHaku(haku: Haku): boolean {
  return (
    haku.hakutapaKoodiUri.startsWith('hakutapa_01') &&
    haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_11')
  );
}

export async function getHaku(oid: string): Promise<Haku> {
  const response = await client.get(`${configuration.hakuUrl}/${oid}`);
  return mapToHaku(response.data);
}

export async function getHakukohteet(hakuOid: string): Promise<Hakukohde[]> {
  const response = await client.get(
    `${configuration.hakukohteetUrl}&haku=${hakuOid}`,
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
