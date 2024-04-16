"use client";

import { configuration } from "./configuration";
import axios from "axios";
import { TranslatedName } from "./common";
import { Haku, Hakukohde, Tila } from "./kouta-types";

const client = axios.create({
  headers: {
    Accept: "application/json",
    "Caller-id": "1.2.246.562.10.00000000001.valintojen-toteuttaminen",
    "Content-type": "Application/x-www-form-urlencoded",
    CSRF: "1.2.246.562.10.00000000001.valintojen-toteuttaminen",
  },
});

export async function getHaut(active: boolean = true) {
  console.log("LOGIN TO KOUTA");
  const login = await client.get("/kouta-internal/auth/login");

  const response = await client.get(configuration.hautUrl);
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
  const response = await client.get(`${configuration.hakuUrl}/${oid}`);
  return response.data.nimi;
}

export async function getHakukohteet(hakuOid: string): Promise<Hakukohde[]> {
  const response = await client.get(
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
