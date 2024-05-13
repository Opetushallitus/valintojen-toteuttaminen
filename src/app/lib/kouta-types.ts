import { TranslatedName } from './common';

const STARTING_YEAR = 2019; // check earliest kouta haku

export type HaunAlkaminen = {
  alkamisVuosi: number;
  alkamisKausiKoodiUri: string;
  alkamisKausiNimi: string;
  value: string;
};

//TODO: localization
export const getAlkamisKausi = (alkamisKausiKoodiUri: string) =>
  alkamisKausiKoodiUri.startsWith('kausi_s') ? 'SYKSY' : 'KEVÄT';

export const getHakuAlkamisKaudet = (): HaunAlkaminen[] => {
  const nowYear = new Date().getFullYear();
  const alkamiset: HaunAlkaminen[] = [];
  for (let i = nowYear; i >= STARTING_YEAR; i--) {
    alkamiset.push({
      alkamisVuosi: i,
      alkamisKausiKoodiUri: 'kausi_s',
      alkamisKausiNimi: 'SYKSY',
      value: `syksy_${i}`,
    });
    alkamiset.push({
      alkamisVuosi: i,
      alkamisKausiKoodiUri: 'kausi_k',
      alkamisKausiNimi: 'KEVÄT',
      value: `kevat_${i}`,
    });
  }
  return alkamiset;
};

//TODO: check whether any values are optional
export type Haku = {
  oid: string;
  nimi: TranslatedName;
  tila: Tila;
  alkamisVuosi: number;
  alkamisKausiKoodiUri: string;
  hakutapaKoodiUri: string;
  hakukohteita: number;
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
