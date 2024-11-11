import { configuration } from './configuration';
import { client } from './http-client';
import { Language, TranslatedName } from './localization/localization-types';

export type Koodi = {
  koodiUri: string;
  nimi: TranslatedName;
  koodiArvo: string;
};

type CodeElement = {
  koodiUri: string;
  koodiArvo: string;
  metadata: [{ nimi: string; kieli: string }];
};

const getTranslatedNimi = (
  language: Language,
  metadata: [{ nimi: string; kieli: string }],
): string => {
  const matchingData = metadata.find(
    (m: { nimi: string; kieli: string }) => m.kieli.toLowerCase() === language,
  );
  return matchingData ? matchingData.nimi : '';
};

const mapToKoodi = (k: CodeElement): Koodi => {
  const translated = {
    fi: getTranslatedNimi('fi', k.metadata),
    sv: getTranslatedNimi('sv', k.metadata),
    en: getTranslatedNimi('en', k.metadata),
  };
  return { koodiUri: k.koodiUri, nimi: translated, koodiArvo: k.koodiArvo };
};

async function getKoodit(koodisto: string): Promise<Koodi[]> {
  const response = await client.get<Array<CodeElement>>(
    configuration.kooditUrl + koodisto,
  );
  return response.data.map(mapToKoodi);
}

export async function getHakutavat(): Promise<Koodi[]> {
  return getKoodit('hakutapa');
}

export async function getHyvaksynnanEhdot(): Promise<Koodi[]> {
  return getKoodit('hyvaksynnanehdot');
}

export async function getPostitoimipaikka(
  postinumero: string,
): Promise<TranslatedName> {
  const { data } = await client.get<CodeElement>(
    configuration.koodiUrl(`posti_${postinumero}`),
  );
  return mapToKoodi(data).nimi;
}
