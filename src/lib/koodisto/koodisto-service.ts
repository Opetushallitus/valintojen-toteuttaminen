import { getConfiguration } from '@/hooks/useConfiguration';
import { client } from '../http-client';
import { Language, TranslatedName } from '../localization/localization-types';
import { Koodi } from './koodisto-types';

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

async function getKoodit(koodisto: string): Promise<Array<Koodi>> {
  const configuration = await getConfiguration();
  const response = await client.get<Array<CodeElement>>(
    configuration.kooditUrl({}) + koodisto,
  );
  return response.data.map(mapToKoodi);
}

export async function getHakutavat(): Promise<Array<Koodi>> {
  return getKoodit('hakutapa');
}

export async function getHyvaksynnanEhdot(): Promise<Array<Koodi>> {
  return getKoodit('hyvaksynnanehdot');
}

export async function getPostitoimipaikka(
  postinumero: string,
): Promise<TranslatedName> {
  const configuration = await getConfiguration();
  const { data } = await client.get<CodeElement>(
    configuration.koodiUrl({codeElementUri: `posti_${postinumero}`}),
  );
  return mapToKoodi(data).nimi;
}
