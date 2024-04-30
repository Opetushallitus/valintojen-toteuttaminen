'use client';

import { configuration } from './configuration';
import { TranslatedName } from './common';
import { Haku, Hakukohde, Tila } from './kouta-types';
import { client } from './http-client';

export async function getHaut() {
  const response = await client.get(configuration.hautUrl);
  const haut: Haku[] = response.data.map(
    (h: {
      oid: string;
      nimi: TranslatedName;
      tila: string;
      hakutapaKoodiUri: string;
      hakuvuosi: string;
      hakukausi: string;
      totalHakukohteet: number;
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
      };
    },
  );
  return haut;
}

export async function getHaku(oid: string): Promise<TranslatedName> {
  const response = await client.get(`${configuration.hakuUrl}/${oid}`);
  return response.data.nimi;
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
