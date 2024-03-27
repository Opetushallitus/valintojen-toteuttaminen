import { configuration } from "./configuration";
import axios from "axios";
import { TranslatedName, Language } from "./common";

export type Koodi = {
  koodiUri: string,
  nimi:  TranslatedName,
}

async function getKoodit(koodisto: string): Promise<Koodi[]> {
  const headers = {
    accept: 'application/json', 
    'Caller-id': 'valintojen-toteuttaminen'
  };

  const getTranslatedNimi = (language: Language, metadata: [{nimi: string, kieli: string}]): string => {
    const matchingData= metadata.find((m: {nimi: string, kieli: string}) => 
      Language[m.kieli.toUpperCase() as keyof typeof Language] === language);
    return matchingData ? matchingData.nimi : '';
  }

  const response = await axios.get(configuration.kooditUrl + koodisto, {headers});
  return response.data.map((k: { koodiUri: string, metadata: [{nimi: string, kieli: string}]}) => {
    const translated = {
      fi: getTranslatedNimi(Language.FI, k.metadata),
      sv: getTranslatedNimi(Language.SV, k.metadata),
      en: getTranslatedNimi(Language.EN, k.metadata),  
    };
    return {koodiUri: k.koodiUri, nimi: translated};
  });
}

export async function getHakutavat(): Promise<Koodi[]> {
  return await getKoodit('hakutapa');
}


