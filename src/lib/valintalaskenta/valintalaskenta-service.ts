'use client';

import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';
import { booleanToString } from '../common';
import { configuration } from '../configuration';
import { client } from '../http-client';
import { getHakemukset } from '../ataru/ataru-service';
import { getLatestSijoitteluAjonTuloksetForHakukohde } from '../valinta-tulos-service/valinta-tulos-service';
import { getHakukohteenValintatuloksetIlmanHakijanTilaa } from '../valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import {
  HakijaryhmanHakija,
  HakukohteenHakijaryhma,
  JarjestyskriteeriTila,
  LaskentaSummary,
  LaskentaStart,
  ValintalaskennanTulosValinnanvaiheModel,
  SeurantaTiedot,
} from '../types/laskenta-types';
import {
  HenkilonValintaTulos,
  SijoitteluajonTulokset,
  SijoitteluajonValintatapajono,
  SijoittelunHakemus,
  SijoittelunTila,
} from '../types/sijoittelu-types';
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
} from '../types/harkinnanvaraiset-types';
import { queryOptions } from '@tanstack/react-query';
import { getFullnameOfHakukohde, Haku, Hakukohde } from '../kouta/kouta-types';
import { ValinnanvaiheTyyppi, ValintaryhmaHakukohteilla } from '../valintaperusteet/valintaperusteet-types';
import { translateName } from '../localization/translation-utils';

const formSearchParamsForStartLaskenta = ({
  laskentaUrl,
  haku,
  hakukohde,
  valinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  valinnanvaihe,
  valintaryhmaOid,
}: {
  laskentaUrl: URL;
  haku: Haku;
  hakukohde?: Hakukohde;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean;
  valinnanvaihe?: number;
  valintaryhmaOid?: string;
}): URL => {
  laskentaUrl.searchParams.append(
    'erillishaku',
    '' + sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  );
  laskentaUrl.searchParams.append('haunnimi', translateName(haku.nimi));
  laskentaUrl.searchParams.append(
    'nimi',
    hakukohde ? getFullnameOfHakukohde(hakukohde, translateName) : '',
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
  if (valintaryhmaOid) {
    laskentaUrl.searchParams.append('valintaryhma', valintaryhmaOid);
  }
  return laskentaUrl;
};

type LaskentaStatusResponseData = {
  latausUrl: string;
  lisatiedot: {
    luotiinkoUusiLaskenta: boolean;
  };
};

export const kaynnistaLaskenta = async ({
  haku,
  hakukohteet,
  valintaryhma,
  valinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  valinnanvaihe,
}: {
  haku: Haku;
  hakukohteet: Array<Hakukohde>;
  valintaryhma?: ValintaryhmaHakukohteilla;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean;
  valinnanvaihe?: number;
}): Promise<LaskentaStart> => {
  const laskentaTyyppi = valintaryhma ? 'VALINTARYHMA' : 'HAKUKOHDE';
  const singleHakukohde = hakukohteet.length === 1 ? hakukohteet[0] : undefined;
  const laskentaUrl = formSearchParamsForStartLaskenta({
    laskentaUrl: new URL(
      `${configuration.valintalaskentakerrallaUrl}/haku/${haku.oid}/tyyppi/${laskentaTyyppi}/whitelist/true?`,
    ),
    haku,
    hakukohde: singleHakukohde,
    valinnanvaiheTyyppi: valinnanvaiheTyyppi,
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
    valinnanvaihe,
    valintaryhmaOid: valintaryhma?.oid,
  });
  const response = await client.post<LaskentaStatusResponseData>(
    laskentaUrl.toString(),
    hakukohteet.map(prop('oid')),
  );
  return {
    startedNewLaskenta: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const keskeytaLaskenta = async ({
  laskentaUuid,
}: {
  laskentaUuid: string;
}): Promise<void> => {
  await client.delete<void>(
    `${configuration.valintalaskentakerrallaUrl}/haku/${laskentaUuid}`,
  );
};

export const getLaskennanYhteenveto = async (
  loadingUrl: string,
): Promise<LaskentaSummary> => {
  const response = await client.get<LaskentaSummary>(
    `${configuration.valintalaskentakerrallaUrl}/status/${loadingUrl}/yhteenveto`,
  );
  return response.data;
};

export const hakukohteenValintalaskennanTuloksetQueryOptions = (
  hakukohdeOid: string,
) =>
  queryOptions({
    queryKey: ['getHakukohteenValintalaskennanTulokset', hakukohdeOid],
    queryFn: () => getHakukohteenValintalaskennanTulokset(hakukohdeOid),
  });

export const getHakukohteenValintalaskennanTulokset = async (
  hakukohdeOid: string,
) => {
  const response = await client.get<
    Array<ValintalaskennanTulosValinnanvaiheModel>
  >(configuration.hakukohteenValintalaskennanTuloksetUrl({ hakukohdeOid }));
  return response.data;
};

export type HakemuksenValintalaskennanTuloksetModel = {
  hakuoid: string;
  hakemusoid: string;
  hakijaOid: string;
  hakukohteet: Array<{
    tarjoajaoid: string;
    oid: string;
    prioriteetti: number;
    hakukohdeRyhmaOids: Array<string>;
    valinnanvaihe: Array<ValintalaskennanTulosValinnanvaiheModel>;
    kaikkiJonotSijoiteltu: boolean;
    harkinnanvaraisuus: boolean;
    hakijaryhma: Array<unknown>;
  }>;
};

export const hakemuksenValintalaskennanTuloksetQueryOptions = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  return queryOptions({
    queryKey: ['getHakemuksenValintalaskennanTulokset', hakuOid, hakemusOid],
    queryFn: () =>
      getHakemuksenValintalaskennanTulokset({ hakuOid, hakemusOid }),
  });
};

export const getHakemuksenValintalaskennanTulokset = async ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const response = await client.get<HakemuksenValintalaskennanTuloksetModel>(
    configuration.hakemuksenValintalaskennanTuloksetUrl({
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
    jonosija: response.data?.jonosija,
  };
};

type MuutaSijoitteluaResponse = {
  prioriteetti: number;
  [x: string]: string | number | boolean | null;
};

export type MuutaSijoittelunStatusProps = {
  jono: Pick<
    LaskennanValintatapajonoTulosWithHakijaInfo,
    'oid' | 'prioriteetti'
  >;
  status: boolean;
};

export const muutaSijoittelunStatus = async ({
  jono,
  status,
}: {
  jono: Pick<
    LaskennanValintatapajonoTulosWithHakijaInfo,
    'oid' | 'prioriteetti'
  >;
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
): Promise<Array<HakukohteenHakijaryhma>> => {
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
    const ryhmanHakijat: Array<HakijaryhmanHakija> = hakemukset.map((h) => {
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
  valintatulokset: Array<HenkilonValintaTulos>,
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
  hakijanHakemukset: Array<SijoittelunHakemus>,
  valintatapajonot: Array<SijoitteluajonValintatapajono>,
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

type JarjestyskriteeriChangeResult = {
  hakukohdeOid: string;
  hakuOid: string;
  valintatapajonoOid: string;
  hakemusOid: string;
  harkinnanvarainen: boolean | null;
  jarjestyskriteerit: Array<{
    arvo: number;
    tila: SijoittelunTila;
    kuvaus: {
      FI?: string;
    };
    prioriteetti: number;
  }>;
};

export const saveJonosijanJarjestyskriteeri = ({
  valintatapajonoOid,
  hakemusOid,
  jarjestyskriteeriPrioriteetti,
  tila,
  arvo,
  selite,
}: SaveJarjestyskriteeriParams) => {
  return client.post<JarjestyskriteeriChangeResult>(
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
  return client.delete<JarjestyskriteeriChangeResult>(
    configuration.jarjestyskriteeriMuokkausUrl({
      valintatapajonoOid,
      hakemusOid,
      jarjestyskriteeriPrioriteetti,
    }),
  );
};

export const saveValinnanvaiheTulokset = ({
  hakukohde,
  valinnanvaihe,
}: {
  hakukohde: Pick<Hakukohde, 'oid' | 'tarjoajaOid'>;
  valinnanvaihe: ValintalaskennanTulosValinnanvaiheModel;
}) => {
  const url = new URL(
    configuration.hakukohteenValintalaskennanTuloksetUrl({
      hakukohdeOid: hakukohde.oid,
    }),
  );

  url.searchParams.set('tarjoajaOid', hakukohde.tarjoajaOid);
  return client.post<ValintalaskennanTulosValinnanvaiheModel>(
    url,
    valinnanvaihe,
  );
};
