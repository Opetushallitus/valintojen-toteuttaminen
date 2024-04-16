"use server";

import { cookies } from "next/headers";
import { configuration } from "./configuration";
import axios from "axios";
import cookie from "cookie";
import { TranslatedName } from "./common";
import { Haku, Hakukohde, Tila } from "./kouta-types";

const KOUTA_COOKIE_NAME = "session";
const KOUTA_COOKIE_PATH = "kouta-internal";

const headers = {
  accept: "application/json",
  "Caller-id": "valintojen-toteuttaminen",
};

export async function getHaut(active: boolean = true) {
  const cook = cookies().get(configuration.sessionCookie);
  //TODO: WRONG COOKIE, SHOULD BE (CAS)TGC
  console.log("COOOKKKKKKIEEEEE");
  console.log(
    `${cookie.serialize("session", cook?.value || "")};${cookie.serialize(
      "CSRF",
      "1.2.246.562.10.00000000001.valintojen-toteuttaminen"
    )}`
  );

  const client = axios.create({
    withCredentials: true,
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Caller-id": "1.2.246.562.10.00000000001.valintojen-toteuttaminen",
      Connection: "keep-alive",
      "Content-type": "Application/x-www-form-urlencoded",
      CSRF: "1.2.246.562.10.00000000001.valintojen-toteuttaminen",
      Cookie: `${cookie.serialize(
        "CSRF",
        "1.2.246.562.10.00000000001.valintojen-toteuttaminen"
      )}`,
      Host: "localhost",
    },
  });
  client.defaults.maxRedirects = 0;
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && [301, 302].includes(error.response.status)) {
        const redirectUrl = error.response.headers.location;
        console.log("REDIRECTING");
        console.log(redirectUrl);
        return client.get(redirectUrl);
      }
      return Promise.reject(error);
    }
  );
  //console.log(client.options("headers"));
  console.log("LOGIN TO KOUTA");
  const login = await client.get(
    "https://localhost:3404/kouta-internal/auth/login"
  );
  console.log(login);

  //console.log(headers);
  //console.log("FETCHING HAUT")
  const resp = await client.get(configuration.hautUrl);
  //console.log(resp);
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
  const haut: Haku[] = response.data.map(
    (h: {
      oid: string;
      nimi: TranslatedName;
      tila: string;
      hakutapaKoodiUri: string;
      hakuvuosi: string;
      hakukausi: string;
      hakukohdeOids: string[];
    }) => {
      const haunTila: Tila = Tila[h.tila.toUpperCase() as keyof typeof Tila];
      return {
        oid: h.oid,
        nimi: h.nimi,
        tila: haunTila,
        hakutapaKoodiUri: h.hakutapaKoodiUri,
        alkamisVuosi: parseInt(h.hakuvuosi),
        alkamisKausiKoodiUri: h.hakukausi,
        hakukohteita: h.hakukohdeOids.length,
      };
    }
  );
  return haut;
}

export async function getHaku(oid: string): Promise<TranslatedName> {
  const response = await axios.get(`${configuration.hakuUrl}/${oid}`, {
    headers,
  });
  return response.data.nimi;
}

export async function getHakukohteet(hakuOid: string): Promise<Hakukohde[]> {
  const response = await axios.get(
    `${configuration.hakukohteetUrl}?haku=${hakuOid}`
  );
  const hakukohteet: Hakukohde[] = response.data.map(
    (h: {
      oid: string;
      nimi: TranslatedName;
      organisaatioOid: string;
      organisaatioNimi: TranslatedName;
    }) => {
      return {
        oid: h.oid,
        nimi: h.nimi,
        organisaatioNimi: h.organisaatioNimi,
        organisaatioOid: h.organisaatioOid,
      };
    }
  );
  return hakukohteet;
}
