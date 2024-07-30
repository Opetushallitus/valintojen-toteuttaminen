'use client';

import { LaskettuJonoWithHakijaInfo } from '../hooks/useLasketutValinnanVaiheet';
import { booleanToString } from './common';
import { configuration } from './configuration';
import { client } from './http-client';
import { getHakemukset, Hakemus } from './ataru';
import {
  getLatestSijoitteluAjonTulokset,
  SijoitteluajonTulokset,
  SijoitteluajonValintatapajono,
  SijoittelunHakemus,
  SijoittelunTila,
} from './valinta-tulos-service';
import {
  getHakukohteenValintatuloksetIlmanHakijanTilaa,
  HenkilonValintaTulos,
} from './valintalaskentakoostepalvelu';

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

type JarjestyskriteeriTila = 'HYLATTY' | 'HYVAKSYTTAVISSA';

export type HakijaryhmanHakija = {
  hakijanNimi: string;
  kuuluuHakijaryhmaan: boolean;
  hakemusOid: string;
  henkiloOid: string;
  hyvaksyttyHakijaryhmasta: boolean;
  sijoittelunTila?: SijoittelunTila;
  vastaanottoTila?: string;
  pisteet: number;
  jononNimi?: string;
  varasijanNumero?: number;
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
  const tulokset = await getLatestSijoitteluAjonTulokset(hakuOid, hakukohdeOid);
  const valintaTulokset = await getHakukohteenValintatuloksetIlmanHakijanTilaa(
    hakuOid,
    hakukohdeOid,
  );
  const sijoittelunHakemukset = tulokset?.valintatapajonot
    ?.map((jono) => jono.hakemukset)
    .reduce((a, b) => a.concat(b));
  const { data } = await client.get(
    configuration.hakukohdeHakijaryhmatUrl({ hakukohdeOid }),
  );
  return data.map(
    (ryhma: {
      nimi: string;
      hakijaryhmaOid: string;
      prioriteetti: number;
      valintatapajonoOid: string;
      jonosijat: [
        {
          hakemusOid: string;
          jarjestyskriteerit: [{ tila: JarjestyskriteeriTila }];
        },
      ];
    }) => {
      const ryhmanHakijat: HakijaryhmanHakija[] = hakemukset.map((h) => {
        const hakemusSijoittelussa = findHakemusSijoittelussa(
          sijoittelunHakemukset,
          tulokset.valintatapajonot,
          h,
        );
        const jonosijanTiedot = ryhma.jonosijat.find(
          (js) => js.hakemusOid === h.oid,
        );
        const sijoittelunTila = hakemusSijoittelussa?.tila;
        const pisteet = hakemusSijoittelussa?.pisteet;
        const vastaanottoTila = findVastaanottotila(
          valintaTulokset,
          hakemusSijoittelussa,
        );
        const kuuluuRyhmaan =
          jonosijanTiedot?.jarjestyskriteerit[0]?.tila === 'HYVAKSYTTAVISSA';
        const jononNimi = tulokset?.valintatapajonot?.find(
          (j) => j.oid === hakemusSijoittelussa.valintatapajonoOid,
        )?.nimi;
        return {
          hakijanNimi: h.hakijanNimi,
          hakemusOid: h.oid,
          henkiloOid: h.henkiloOid,
          hyvaksyttyHakijaryhmasta: isHyvaksyttyHakijaryhmasta(
            ryhma.hakijaryhmaOid,
            hakemusSijoittelussa,
          ),
          kuuluuHakijaryhmaan: kuuluuRyhmaan,
          sijoittelunTila,
          pisteet: pisteet ?? 0,
          vastaanottoTila,
          jononNimi,
          varasijanNumero: hakemusSijoittelussa.varasijanNumero,
        };
      });
      const ryhmanValintatapajonoNimi = tulokset.valintatapajonot.find(
        (jono) => jono.oid === ryhma.valintatapajonoOid,
      )?.nimi;
      const nimi =
        ryhma.nimi +
        (ryhmanValintatapajonoNimi ? `, ${ryhmanValintatapajonoNimi}` : '');
      return {
        nimi,
        oid: ryhma.hakijaryhmaOid,
        prioriteetti: ryhma.prioriteetti,
        kiintio: getKiintio(tulokset, ryhma.hakijaryhmaOid),
        hakijat: ryhmanHakijat,
      };
    },
  );
};

const findVastaanottotila = (
  valintatulokset: HenkilonValintaTulos[],
  hakemusSijoittelussa: SijoittelunHakemus,
) => {
  if (hakemusSijoittelussa) {
    return valintatulokset.find(
      (tulos) => tulos.hakijaOid === hakemusSijoittelussa.hakijaOid,
    )?.tila;
  }
};

const sijoittelunTilaOrdinal = (tila: SijoittelunTila): number => {
  return [
    'VARALLA',
    'HYVAKSYTTY',
    'VARASIJALTA_HYVAKSYTTY',
    'HARKINNANVARAISESTI_HYVAKSYTTY',
  ].indexOf(tila);
};

const findHakemusSijoittelussa = (
  hakemuksetSijoittelussa: SijoittelunHakemus[],
  valintatapajonot: SijoitteluajonValintatapajono[],
  hakijanHakemus: Hakemus,
): SijoittelunHakemus => {
  const hakijanHakemukset = hakemuksetSijoittelussa.filter(
    (h) => h.hakemusOid === hakijanHakemus.oid,
  );
  return hakijanHakemukset.reduce((h, hakemus) => {
    if (sijoittelunTilaOrdinal(hakemus.tila) > sijoittelunTilaOrdinal(h.tila)) {
      return hakemus;
    }
    if (sijoittelunTilaOrdinal(hakemus.tila) < sijoittelunTilaOrdinal(h.tila)) {
      return h;
    }
    if (
      (valintatapajonot.find((jono) => jono.oid === hakemus.valintatapajonoOid)
        ?.prioriteetti ?? Number.MAX_SAFE_INTEGER) <
      (valintatapajonot.find((jono) => jono.oid === h.valintatapajonoOid)
        ?.prioriteetti ?? Number.MAX_SAFE_INTEGER)
    ) {
      return hakemus;
    }
    return h;
  });
};

const isHyvaksyttyHakijaryhmasta = (
  hakijaryhmaOid: string,
  hakemusSijoittelussa: SijoittelunHakemus,
) => hakemusSijoittelussa.hyvaksyttyHakijaryhmista.includes(hakijaryhmaOid);

//Voisiko tässä käyttää lasketussahakijaryhmässä olevaa kiintiötä?
const getKiintio = (
  sijoittelunTulos: SijoitteluajonTulokset,
  hakijaryhmaOid: string,
): number =>
  sijoittelunTulos?.hakijaryhmat?.find((r) => r.oid === hakijaryhmaOid)
    ?.kiintio ?? 0;
