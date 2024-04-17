import { configuration } from './configuration';
import { TranslatedName, Language } from './common';
import { client } from './http-client';

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
      (m: { nimi: string; kieli: string }) =>
        Language[m.kieli.toUpperCase() as keyof typeof Language] === language,
    );
    return matchingData ? matchingData.nimi : '';
  };

  const response = await client.get(configuration.kooditUrl + koodisto);
  return response.data.map(
    (k: { koodiUri: string; metadata: [{ nimi: string; kieli: string }] }) => {
      const translated = {
        fi: getTranslatedNimi(Language.FI, k.metadata),
        sv: getTranslatedNimi(Language.SV, k.metadata),
        en: getTranslatedNimi(Language.EN, k.metadata),
      };
      return { koodiUri: k.koodiUri, nimi: translated };
    },
  );
}

export async function getHakutavat(): Promise<Koodi[]> {
  return getKoodit('hakutapa');
}
