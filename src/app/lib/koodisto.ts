import { configuration } from './configuration';
import { client } from './http-client';
import { Language, TranslatedName } from './localization/localization-types';

export type Koodi = {
  koodiUri: string;
  nimi: TranslatedName;
  koodiArvo: string;
};

async function getKoodit(koodisto: string): Promise<Koodi[]> {
  const getTranslatedNimi = (
    language: Language,
    metadata: [{ nimi: string; kieli: string }],
  ): string => {
    const matchingData = metadata.find(
      (m: { nimi: string; kieli: string }) =>
        m.kieli.toLowerCase() === language,
    );
    return matchingData ? matchingData.nimi : '';
  };

  const response = await client.get<
    Array<{
      koodiUri: string;
      koodiArvo: string;
      metadata: [{ nimi: string; kieli: string }];
    }>
  >(configuration.kooditUrl + koodisto);
  return response.data.map((k) => {
    const translated = {
      fi: getTranslatedNimi('fi', k.metadata),
      sv: getTranslatedNimi('sv', k.metadata),
      en: getTranslatedNimi('en', k.metadata),
    };
    return { koodiUri: k.koodiUri, nimi: translated, koodiArvo: k.koodiArvo };
  });
}

export async function getHakutavat(): Promise<Koodi[]> {
  return getKoodit('hakutapa');
}

export async function getHyvaksynnanEhdot(): Promise<Koodi[]> {
  return getKoodit('hyvaksynnanehdot');
}
