import { cookies } from "next/headers";
import { configuration } from "./configuration";
import axios from "axios";
import cookie from 'cookie';
import { TranslatedName } from "./common";

const KOUTA_COOKIE_NAME = 'session';
const KOUTA_COOKIE_PATH = 'kouta-internal'
const STARTING_YEAR = 2019; // check earliest kouta haku

const headers = {
  accept: 'application/json', 
  'Caller-id': 'valintojen-toteuttaminen'
};

export type HaunAlkaminen = {
  alkamisVuosi: number,
  alkamisKausiKoodiUri: string,
  alkamisKausiNimi: string,
}

//TODO: localization
export const getAlkamisKausi = (alkamisKausiKoodiUri: string) => alkamisKausiKoodiUri.startsWith('kausi_s') ? 'SYKSY' : 'KEVÄT';

export const getHakuAlkamisKaudet = (): HaunAlkaminen[] => {
  const nowYear = new Date().getFullYear();
  const alkamiset: HaunAlkaminen[] = [];
  for (let i = nowYear; i >= STARTING_YEAR; i--) {
    alkamiset.push({alkamisVuosi: i, alkamisKausiKoodiUri: 'kausi_s', alkamisKausiNimi: 'SYKSY'})
    alkamiset.push({alkamisVuosi: i, alkamisKausiKoodiUri: 'kausi_k', alkamisKausiNimi: 'KEVÄT'})
  }
  return alkamiset;
}

//TODO: check whether any values are optional
export type Haku = {
  oid: string,
  nimi:  TranslatedName,
  tila: Tila,
  alkamisVuosi: number,
  alkamisKausiKoodiUri: string,
  hakutapaKoodiUri: string
}

export enum Tila {
  JULKAISTU, ARKISTOITU
}

export async function getHaut(active: boolean = true) {
  /*console.log('here');
  const ticket = cookies().get(configuration.sessionCookie)?.value;
  const headers = {
    accept: 'application/json', 
    'Caller-id': 'valintojen-toteuttaminen',
    'redirect-strategy': 'none',
    'throw-exception': false,
    cookie: cookie.serialize('session', ticket || '', {httpOnly: true, path: '/'})
  };*/
  //const login = await axios.get('https://virkailija.untuvaopintopolku.fi/kouta-internal/auth/login');
  //console.log(login.headers);

  
  const response = await axios.get(configuration.hautUrl, {
    headers,
    });
  const haut: Haku[] = response.data.map((h: { oid: string; nimi: TranslatedName; tila: string, hakutapaKoodiUri: string, hakuvuosi: string, hakukausi: string}) => {
    const haunTila: Tila = Tila[h.tila.toUpperCase() as keyof typeof Tila];
    return {oid: h.oid, nimi: h.nimi, tila: haunTila, hakutapaKoodiUri: h.hakutapaKoodiUri, 
      alkamisVuosi: parseInt(h.hakuvuosi), alkamisKausiKoodiUri: h.hakukausi};
  });
  return haut;
}

export async function getHaku(oid: string): Promise<string> {
  const response = await axios.get(`${configuration.hakuUrl}/${oid}`, {
    headers,
    })
  return response.data.nimi.fi;
}
