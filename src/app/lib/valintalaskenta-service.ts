'use client';

import { LaskettuJonoWithHakijaInfo } from '../hooks/useLasketutValinnanVaiheet';
import { booleanToString } from './common';
import { configuration } from './configuration';
import { client } from './http-client';
import { getHakemukset } from './ataru';
import { getLatestSijoitteluAjonTuloksetForHakukohde } from './valinta-tulos-service';
import { getHakukohteenValintatuloksetIlmanHakijanTilaa } from './valintalaskentakoostepalvelu';
import {
  HakijaryhmanHakija,
  HakukohteenHakijaryhma,
  JarjestyskriteeriTila,
  LaskentaErrorSummary,
  LaskentaStart,
  LaskettuValinnanVaiheModel,
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
  mapValues,
  pipe,
  prop,
} from 'remeda';
import {
  HarkinnanvarainenTila,
  HarkinnanvaraisestiHyvaksytty,
} from './types/harkinnanvaraiset-types';
import { queryOptions } from '@tanstack/react-query';
import { TranslatedName } from './localization/localization-types';
import { getFullnameOfHakukohde, Haku, Hakukohde } from './types/kouta-types';
import { ValinnanvaiheTyyppi } from './types/valintaperusteet-types';

const formSearchParamsForStartLaskenta = ({
  laskentaUrl,
  haku,
  hakukohde,
  valinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  valinnanvaihe,
  translateEntity,
}: {
  laskentaUrl: URL;
  haku: Haku;
  hakukohde: Hakukohde;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean;
  valinnanvaihe?: number;
  translateEntity: (translateable: TranslatedName) => string;
}): URL => {
  laskentaUrl.searchParams.append(
    'erillishaku',
    '' + sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  );
  laskentaUrl.searchParams.append('haunnimi', translateEntity(haku.nimi));
  laskentaUrl.searchParams.append(
    'nimi',
    getFullnameOfHakukohde(hakukohde, translateEntity),
  );
  if (valinnanvaihe && valinnanvaiheTyyppi !== ValinnanvaiheTyyppi.VALINTAKOE) {
    laskentaUrl.searchParams.append('valinnanvaihe', '' + valinnanvaihe);
  }
  if (valinnanvaiheTyyppi) {
    laskentaUrl.searchParams.append(
      'valintakoelaskenta',
      `${valinnanvaiheTyyppi === ValinnanvaiheTyyppi.VALINTAKOE}`,
    );
  }
  return laskentaUrl;
};

type LaskentaStatusResponseData = {
  lisatiedot: {
    luotiinkoUusiLaskenta: boolean;
  };
  latausUrl: string;
};

export const kaynnistaLaskenta = async (
  haku: Haku,
  hakukohde: Hakukohde,
  valinnanvaiheTyyppi: ValinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
  valinnanvaihe: number,
  translateEntity: (translateable: TranslatedName) => string,
): Promise<LaskentaStart> => {
  const laskentaUrl = formSearchParamsForStartLaskenta({
    laskentaUrl: new URL(
      `${configuration.valintalaskentaServiceUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
    ),
    haku,
    hakukohde,
    valinnanvaiheTyyppi: valinnanvaiheTyyppi,
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
    valinnanvaihe,
    translateEntity,
  });
  const response = await client.post<LaskentaStatusResponseData>(
    laskentaUrl.toString(),
    [hakukohde.oid],
  );
  return {
    startedNewLaskenta: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const kaynnistaLaskentaHakukohteenValinnanvaiheille = async (
  haku: Haku,
  hakukohde: Hakukohde,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
  translateEntity: (translateable: TranslatedName) => string,
): Promise<LaskentaStart> => {
  const laskentaUrl = formSearchParamsForStartLaskenta({
    laskentaUrl: new URL(
      `${configuration.valintalaskentaServiceUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
    ),
    haku,
    hakukohde,
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
    translateEntity,
  });
  const response = await client.post<LaskentaStatusResponseData>(
    laskentaUrl.toString(),
    [hakukohde.oid],
  );
  return {
    startedNewLaskenta: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const getLaskennanTilaHakukohteelle = async (
  loadingUrl: string,
): Promise<LaskentaErrorSummary> => {
  const response = await client.get<{
    hakukohteet: Array<{
      hakukohdeOid: string;
      ilmoitukset: [{ otsikko: string; tyyppi: string }] | null;
    }>;
  }>(
    `${configuration.valintalaskentaServiceUrl}valintalaskentakerralla/status/${loadingUrl}/yhteenveto`,
  );
  return response.data?.hakukohteet
    ?.filter((hk) => hk.ilmoitukset?.some((i) => i.tyyppi === 'VIRHE'))
    .map(
      (hakukohde: {
        hakukohdeOid: string;
        ilmoitukset: [{ otsikko: string }] | null;
      }) => {
        return {
          hakukohdeOid: hakukohde.hakukohdeOid,
          notifications: hakukohde.ilmoitukset?.map((i) => i.otsikko),
        };
      },
    )[0];
};

export const getHakukohteenLasketutValinnanvaiheet = async (
  hakukohdeOid: string,
) => {
  const response = await client.get<Array<LaskettuValinnanVaiheModel>>(
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
    valinnanvaihe: Array<LaskettuValinnanVaiheModel>;
    kaikkiJonotSijoiteltu: boolean;
    harkinnanvaraisuus: boolean;
    hakijaryhma: Array<unknown>;
  }>;
};

export const hakemuksenLasketutValinnanvaiheetQueryOptions = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  return queryOptions({
    queryKey: ['getHakemuksenLasketutValinnanvaiheet', hakuOid, hakemusOid],
    queryFn: () =>
      getHakemuksenLasketutValinnanvaiheet({ hakuOid, hakemusOid }),
  });
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
  return pipe(
    response.data.hakukohteet,
    indexBy(prop('oid')),
    mapValues(prop('valinnanvaihe')),
  );
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

export type MuutaSijoittelunStatusProps = {
  jono: Pick<LaskettuJonoWithHakijaInfo, 'oid' | 'prioriteetti'>;
  status: boolean;
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
    getLatestSijoitteluAjonTuloksetForHakukohde(hakuOid, hakukohdeOid),
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

type JarjestyskriteeriKeyParams = {
  valintatapajonoOid: string;
  hakemusOid: string;
  jarjestyskriteeriPrioriteetti: number;
};

export type SaveJarjestyskriteeriParams = JarjestyskriteeriKeyParams & {
  tila: string;
  arvo: string;
  selite: string;
};

export const saveJonosijanJarjestyskriteeri = ({
  valintatapajonoOid,
  hakemusOid,
  jarjestyskriteeriPrioriteetti,
  tila,
  arvo,
  selite,
}: SaveJarjestyskriteeriParams) => {
  return client.post<null>(
    configuration.jarjestyskriteeriMuokkausUrl({
      valintatapajonoOid,
      hakemusOid,
      jarjestyskriteeriPrioriteetti,
    }),
    {
      tila,
      arvo,
      selite,
    },
  );
};

export const deleteJonosijanJarjestyskriteeri = ({
  valintatapajonoOid,
  hakemusOid,
  jarjestyskriteeriPrioriteetti,
}: JarjestyskriteeriKeyParams) => {
  return client.delete<null>(
    configuration.jarjestyskriteeriMuokkausUrl({
      valintatapajonoOid,
      hakemusOid,
      jarjestyskriteeriPrioriteetti,
    }),
  );
};
