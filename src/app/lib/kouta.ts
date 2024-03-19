import { cookies } from "next/headers";
import { configuration } from "./configuration";
import axios from "axios";
import cookie from 'cookie';

const KOUTA_COOKIE_NAME = 'session';
const KOUTA_COOKIE_PATH = 'kouta-internal'

type TranslatedName = {
  fi?: string,
  en?: string,
  sv?: string
}

export type Haku = {
  oid: string,
  nimi:  TranslatedName,
  tila: Tila
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

  const headers = {
    accept: 'application/json', 
    'Caller-id': 'valintojen-toteuttaminen'
  };
  
  const response = await axios.get(configuration.hautUrl, {
    headers,
    });
  const haut: Haku[] = response.data.map((h: { oid: any; nimi: any; tila: string}) => {
    const haunTila: Tila = Tila[h.tila.toUpperCase() as keyof typeof Tila];
    return {oid: h.oid, nimi: h.nimi, tila: haunTila};
  });
  return haut;
}
