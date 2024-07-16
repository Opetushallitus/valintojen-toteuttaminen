import { TranslatedName } from './localization/localization-types';

const STARTING_YEAR = 2019; // check earliest kouta haku

export type HaunAlkaminen = {
  alkamisVuosi: number;
  alkamisKausiKoodiUri: string;
  alkamisKausiNimi: string;
  value: string;
};

export const getHakuAlkamisKaudet = (): HaunAlkaminen[] => {
  const nowYear = new Date().getFullYear();
  const alkamiset: HaunAlkaminen[] = [];
  for (let i = nowYear; i >= STARTING_YEAR; i--) {
    alkamiset.push({
      alkamisVuosi: i,
      alkamisKausiKoodiUri: 'kausi_s',
      alkamisKausiNimi: 'yleinen.syksy',
      value: `${i}_syksy`,
    });
    alkamiset.push({
      alkamisVuosi: i,
      alkamisKausiKoodiUri: 'kausi_k',
      alkamisKausiNimi: 'yleinen.kevat',
      value: `${i}_kevat`,
    });
  }
  return alkamiset;
};

export type Haku = {
  oid: string;
  nimi: TranslatedName;
  tila: Tila;
  alkamisVuosi: number;
  alkamisKausiKoodiUri: string;
  hakutapaKoodiUri: string;
  hakukohteita: number;
  kohdejoukkoKoodiUri: string;
};

export type Hakukohde = {
  oid: string;
  nimi: TranslatedName;
  organisaatioOid: string;
  organisaatioNimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
};

export enum Tila {
  JULKAISTU = 'julkaistu',
  ARKISTOITU = 'arkistoitu',
}

export function getFullnameOfHakukohde(
  hakukohde: Hakukohde,
  translateEntity: (translateable: TranslatedName) => string,
): string {
  const orgName = translateEntity(
    hakukohde.jarjestyspaikkaHierarkiaNimi ?? hakukohde.organisaatioNimi,
  );
  const hakukohdeName = translateEntity(hakukohde.nimi);
  return `${orgName}: ${hakukohdeName}`;
}
