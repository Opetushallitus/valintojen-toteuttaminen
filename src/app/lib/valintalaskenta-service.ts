'use client';

import { LaskettuJonoWithHakijaInfo } from '../hooks/useLasketutValinnanVaiheet';
import { booleanToString } from './common';
import { configuration } from './configuration';
import { client } from './http-client';
import { getHakemukset, Hakemus } from './ataru';

export type Jarjestyskriteeri = {
  arvo: number;
  tila: string;
  prioriteetti: number;
  nimi: string;
  kuvaus?: {
    FI?: string;
    SV?: string;
    EN?: string;
  };
};

export type JonoSija = {
  jonosija: number;
  hakemusOid: string;
  hakijaOid: string;
  tuloksenTila: string;
  harkinnanvarainen: boolean;
  prioriteetti: number;
  jarjestyskriteerit: Array<Jarjestyskriteeri>;
};

export type LaskettuValintatapajono = {
  oid: string;
  nimi: string;
  valintatapajonooid: string;
  prioriteetti: number;
  jonosijat: Array<JonoSija>;
  valmisSijoiteltavaksi: boolean;
  siirretaanSijoitteluun: boolean;
};

export type LaskettuValinnanVaihe = {
  jarjestysnumero: number;
  valinnanvaiheoid: string;
  hakuOid: string;
  nimi: string;
  createdAt: number;
  valintatapajonot?: Array<LaskettuValintatapajono>;
};

export type SeurantaTiedot = {
  tila: 'VALMIS' | 'MENEILLAAN';
  hakukohteitaYhteensa: number;
  hakukohteitaValmiina: number;
  hakukohteitaKeskeytetty: number;
};

export const getLasketutValinnanVaiheet = async (
  hakukohdeOid: string,
): Promise<Array<LaskettuValinnanVaihe>> => {
  const response = await client.get(
    configuration.lasketutValinnanVaiheetUrl({ hakukohdeOid }),
  );
  return response.data;
};

export const getLaskennanSeurantaTiedot = async (
  loadingUrl: string,
): Promise<SeurantaTiedot> => {
  const response = await client.get(
    `${configuration.seurantaUrl}${loadingUrl}`,
  );
  return {
    tila: response.data.tila,
    hakukohteitaYhteensa: response.data.hakukohteitaYhteensa,
    hakukohteitaValmiina: response.data.hakukohteitaValmiina,
    hakukohteitaKeskeytetty: response.data.hakukohteitaKeskeytetty,
  };
};

export type MuutaSijoitteluaResponse = {
  prioriteetti: number;
  [x: string]: string | number | boolean | null;
};

export const muutaSijoittelunStatus = async ({
  jono,
  status,
}: {
  jono: Pick<LaskettuJonoWithHakijaInfo, 'oid' | 'prioriteetti'>;
  status: boolean;
}): Promise<Array<MuutaSijoitteluaResponse>> => {
  const valintatapajonoOid = jono.oid;

  const { data: updatedJono } = await client.post(
    // Miksi samat parametrit välitetään sekä URL:ssä että bodyssa?
    configuration.automaattinenSiirtoUrl({ valintatapajonoOid, status }),
    {
      valintatapajonoOid,
      status: booleanToString(status),
    },
    {
      cache: 'no-cache',
    },
  );

  if (updatedJono.prioriteetti === -1) {
    // A query for a single jono doesn't return a true prioriteetti value, but -1 as a placeholder, so let's re-set the value
    updatedJono.prioriteetti = jono.prioriteetti;
  }

  const { data } = await client.put(
    configuration.valmisSijoiteltavaksiUrl({ valintatapajonoOid, status }),
    updatedJono,
    {
      cache: 'no-cache',
    },
  );

  return data;
};

type JarjestyskriteeriTila = 'hylatty' | 'hyvaksytty';

export type HakijaryhmanHakija = {
  hakijanNimi: string;
  kuuluuHakijaryhmaan: boolean;
  hakemusOid: string;
  henkiloOid: string;
  hyvaksyttyHakijaryhmasta: boolean;
};

export type HakukohteenHakijaryhma = {
  nimi: string;
  oid: string;
  prioriteetti: number;
  kiintio: number;
  hakijat: HakijaryhmanHakija[];
};

export const getHakijaryhmat = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HakukohteenHakijaryhma[]> => {
  const hakemukset: Hakemus[] = await getHakemukset(hakuOid, hakukohdeOid);
  const { data } = await client.get(
    configuration.hakukohdeHakijaryhmatUrl({ hakukohdeOid }),
  );
  return data.map(
    (ryhma: {
      nimi: string;
      hakijaryhmaOid: string;
      prioriteetti: number;
      kiintio: number;
      jonosijat: [
        {
          hakemusOid: string;
          jarjestyskriteerit: [{ tila: JarjestyskriteeriTila }];
        },
      ];
    }) => {
      const ryhmanHakijat: HakijaryhmanHakija[] = hakemukset.map((h) => {
        const jonosijanTiedot = ryhma.jonosijat.find(
          (js) => js.hakemusOid === h.oid,
        );
        return {
          hakijanNimi: h.hakijanNimi,
          hakemusOid: h.oid,
          henkiloOid: h.henkiloOid,
          hyvaksyttyHakijaryhmasta:
            jonosijanTiedot?.jarjestyskriteerit[0].tila === 'hyvaksytty',
          kuuluuHakijaryhmaan: jonosijanTiedot != undefined,
        };
      });
      return {
        nimi: ryhma.nimi,
        oid: ryhma.hakijaryhmaOid,
        prioriteetti: ryhma.prioriteetti,
        kiintio: ryhma.kiintio,
        hakijat: ryhmanHakijat,
      };
    },
  );
};

/*
                 etunimi: hakemus.etunimet
                      ? hakemus.etunimet
                      : hakemus.answers.henkilotiedot.Etunimet,
                    sukunimi: hakemus.sukunimi
                      ? hakemus.sukunimi
                      : hakemus.answers.henkilotiedot.Sukunimi,
                    hakemusOid: hakija.hakemusOid,
                    hakijaOid: hakija.hakijaOid,
                    ryhmaanKuuluminen: hakija.jarjestyskriteerit[0].tila,
                    jononNimi: hakemusSijoittelussa
                      ? valintatapajonot[
                          hakemusSijoittelussa.valintatapajonoOid
                        ].nimi
                      : undefined,
                    hakemusSijoittelussa: hakemusSijoittelussa,
                    sijoittelunTila: hakemusSijoittelussa
                      ? hakemusSijoittelussa.tila
                      : undefined,
                    vastaanottotila: vastaanottotila,
                    hyvaksyttyHakijaryhmasta: hyvaksyttyHakijaryhmasta,
                    pisteet: hakemusSijoittelussa
                      ? hakemusSijoittelussa.pisteet
                      : undefined,
                      */
