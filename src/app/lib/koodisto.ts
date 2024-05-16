import { configuration } from './configuration';
import { client } from './http-client';
import { Language, TranslatedName } from './localization/localization-types';

export type Koodi = {
  koodiUri: string;
  nimi: TranslatedName;
};

async function getKoodit(koodisto: string): Promise<Koodi[]> {
  const getTranslatedNimi = (
    language: Language,
    metadata: [{ nimi: string; kieli: string }],
  ): string => {
    const matchingData = metadata.find(
      (m: { nimi: string; kieli: string }) => m.kieli === language,
    );
    return matchingData ? matchingData.nimi : '';
  };

  const response = await client.get(configuration.kooditUrl + koodisto);
  return response.data.map(
    (k: { koodiUri: string; metadata: [{ nimi: string; kieli: string }] }) => {
      const translated = {
        fi: getTranslatedNimi('fi', k.metadata),
        sv: getTranslatedNimi('sv', k.metadata),
        en: getTranslatedNimi('en', k.metadata),
      };
      return { koodiUri: k.koodiUri, nimi: translated };
    },
  );
}

export async function getHakutavat(): Promise<Koodi[]> {
  return getKoodit('hakutapa');
}
