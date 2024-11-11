'use client';

import { LaskettuJonoWithHakijaInfo } from '../hooks/useLasketutValinnanVaiheet';
import { booleanToString } from './common';
import { configuration } from './configuration';
import { client } from './http-client';
import { getHakemukset } from './ataru';
import { getLatestSijoitteluAjonTulokset } from './valinta-tulos-service';
import { getHakukohteenValintatuloksetIlmanHakijanTilaa } from './valintalaskentakoostepalvelu';
import {
  HakijaryhmanHakija,
  HakukohteenHakijaryhma,
  JarjestyskriteeriTila,
  LaskettuValinnanVaihe,
  SeurantaTiedot,
} from './types/laskenta-types';
import {
  HenkilonValintaTulos,
  SijoitteluajonTulokset,
  SijoitteluajonValintatapajono,
  SijoittelunHakemus,
  SijoittelunTila,
} from './types/sijoittelu-types';
import {
  filter,
  flatMap,
  groupBy,
  indexBy,
  isDefined,
  pipe,
  prop,
} from 'remeda';
import {
  HarkinnanvarainenTila,
  HarkinnanvaraisestiHyvaksytty,
} from './types/harkinnanvaraiset-types';

export const getHakukohteenLasketutValinnanvaiheet = async (
  hakukohdeOid: string,
) => {
  const response = await client.get<Array<LaskettuValinnanVaihe>>(
    configuration.hakukohteenLasketutValinnanVaiheetUrl({ hakukohdeOid }),
  );
  return response.data;
};

export type HakemuksenValintalaskentaData = {
  hakuoid: string;
  hakemusoid: string;
  hakijaOid: string;
  hakukohteet: Array<{
    tarjoajaoid: string;
    oid: string;
    prioriteetti: number;
    hakukohdeRyhmaOids: Array<string>;
    valinnanvaihe: Array<LaskettuValinnanVaihe>;
    kaikkiJonotSijoiteltu: boolean;
    harkinnanvaraisuus: boolean;
    hakijaryhma: Array<unknown>;
  }>;
};

export const getHakemuksenLasketutValinnanvaiheet = async ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const response = await client.get<HakemuksenValintalaskentaData>(
    configuration.hakemuksenLasketutValinnanvaiheetUrl({
      hakuOid,
      hakemusOid,
    }),
  );
  return response.data;
};

export const getLaskennanSeurantaTiedot = async (loadingUrl: string) => {
  const response = await client.get<SeurantaTiedot>(
    `${configuration.seurantaUrl}${loadingUrl}`,
  );

  return {
    tila: response.data.tila,
    hakukohteitaYhteensa: response.data?.hakukohteitaYhteensa,
    hakukohteitaValmiina: response.data?.hakukohteitaValmiina,
    hakukohteitaKeskeytetty: response.data?.hakukohteitaKeskeytetty,
  };
};

type MuutaSijoitteluaResponse = {
  prioriteetti: number;
  [x: string]: string | number | boolean | null;
};

export const muutaSijoittelunStatus = async ({
  jono,
  status,
}: {
  jono: Pick<LaskettuJonoWithHakijaInfo, 'oid' | 'prioriteetti'>;
  status: boolean;
}) => {
  const valintatapajonoOid = jono.oid;

  const { data: updatedJono } = await client.post<{ prioriteetti: number }>(
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

  const { data } = await client.put<Array<MuutaSijoitteluaResponse>>(
    configuration.valmisSijoiteltavaksiUrl({ valintatapajonoOid, status }),
    updatedJono,
    {
      cache: 'no-cache',
    },
  );

  return data;
};

export const getHakijaryhmat = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HakukohteenHakijaryhma[]> => {
  const [hakemukset, tulokset, valintaTulokset] = await Promise.all([
    getHakemukset({ hakuOid, hakukohdeOid }),
    getLatestSijoitteluAjonTulokset(hakuOid, hakukohdeOid),
    getHakukohteenValintatuloksetIlmanHakijanTilaa(hakuOid, hakukohdeOid),
  ]);
  const sijoittelunHakemukset = pipe(
    tulokset?.valintatapajonot,
    filter(isDefined),
    flatMap((jono) => jono.hakemukset),
    groupBy(prop('hakemusOid')),
  );
  const valintatapajonotSijoittelusta = pipe(
    tulokset?.valintatapajonot,
    filter(isDefined),
    indexBy(prop('oid')),
  );
  const { data } = await client.get<
    Array<{
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
    }>
  >(configuration.hakukohdeHakijaryhmatUrl({ hakukohdeOid }));
  return data.map((ryhma) => {
    const ryhmanHakijat: HakijaryhmanHakija[] = hakemukset.map((h) => {
      const hakemusSijoittelussa = findHakemusSijoittelussa(
        sijoittelunHakemukset[h.hakemusOid],
        tulokset.valintatapajonot,
      );
      const jonosijanTiedot = ryhma.jonosijat.find(
        (js) => js.hakemusOid === h.hakemusOid,
      );
      const sijoittelunTila = hakemusSijoittelussa?.tila;
      const pisteet = hakemusSijoittelussa?.pisteet;
      const vastaanottoTila = findVastaanottotila(
        valintaTulokset,
        hakemusSijoittelussa,
      );
      const kuuluuRyhmaan =
        jonosijanTiedot?.jarjestyskriteerit[0]?.tila === 'HYVAKSYTTAVISSA';
      const jononNimi =
        valintatapajonotSijoittelusta[hakemusSijoittelussa.valintatapajonoOid]
          ?.nimi;
      return {
        hakijanNimi: h.hakijanNimi,
        hakemusOid: h.hakemusOid,
        hakijaOid: h.hakijaOid,
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
  });
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

const sijoittelunTilaOrdinalForHakemus = (tila: SijoittelunTila): number => {
  return [
    'VARALLA',
    'HYVAKSYTTY',
    'VARASIJALTA_HYVAKSYTTY',
    'HARKINNANVARAISESTI_HYVAKSYTTY',
  ].indexOf(tila);
};

const findHakemusSijoittelussa = (
  hakijanHakemukset: SijoittelunHakemus[],
  valintatapajonot: SijoitteluajonValintatapajono[],
): SijoittelunHakemus => {
  return hakijanHakemukset?.reduce((h, hakemus) => {
    if (
      sijoittelunTilaOrdinalForHakemus(hakemus.tila) >
      sijoittelunTilaOrdinalForHakemus(h.tila)
    ) {
      return hakemus;
    }
    if (
      sijoittelunTilaOrdinalForHakemus(hakemus.tila) <
      sijoittelunTilaOrdinalForHakemus(h.tila)
    ) {
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

export const getHarkinnanvaraisetTilat = async ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { data } = await client.get<Array<HarkinnanvaraisestiHyvaksytty>>(
    configuration.getHarkinnanvaraisetTilatUrl({ hakuOid, hakukohdeOid }),
  );
  return data;
};

export const setHarkinnanvaraisetTilat = async (
  harkinnanvaraisetTilat: Array<
    Omit<HarkinnanvaraisestiHyvaksytty, 'harkinnanvaraisuusTila'> & {
      harkinnanvaraisuusTila: HarkinnanvarainenTila | undefined;
    }
  >,
) => {
  return client.post<unknown>(
    configuration.setHarkinnanvaraisetTilatUrl,
    harkinnanvaraisetTilat,
  );
};
