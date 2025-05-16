'use client';

import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';
import { client } from '../http-client';
import { getHakemukset } from '../ataru/ataru-service';
import { getLatestSijoitteluAjonTuloksetForHakukohde } from '../valinta-tulos-service/valinta-tulos-service';
import { getHakukohteenValintatuloksetIlmanHakijanTilaa } from '../valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import {
  HakijaryhmanHakija,
  HakukohteenHakijaryhma,
  JarjestyskriteeriTila,
  LaskentaSummary,
  StartedLaskentaInfo,
  ValintalaskennanTulosValinnanvaiheModel,
  SeurantaTiedot,
  LaskettuHakukohde,
} from '../types/laskenta-types';
import {
  HenkilonValintaTulos,
  SijoitteluajonTulokset,
  SijoitteluajonValintatapajono,
  SijoittelunHakemus,
  ValinnanTila,
} from '../types/sijoittelu-types';
import {
  filter,
  flatMap,
  groupBy,
  indexBy,
  isDefined,
  isNonNull,
  mapValues,
  only,
  pipe,
  prop,
} from 'remeda';
import {
  HarkinnanvarainenTila,
  HarkinnanvaraisestiHyvaksytty,
} from '../types/harkinnanvaraiset-types';
import { queryOptions } from '@tanstack/react-query';
import {
  getFullnameOfHakukohde,
  Haku,
  Hakukohde,
  KoutaOidParams,
} from '../kouta/kouta-types';
import {
  ValinnanvaiheTyyppi,
  ValintaryhmaHakukohteilla,
} from '../valintaperusteet/valintaperusteet-types';
import {
  toFormattedDateTimeString,
  translateName,
} from '../localization/translation-utils';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from '../configuration/configuration-utils';
import { siirraTaiPoistaValintatapajonoAutomaattisestaSijoittelusta } from '../valintaperusteet/valintaperusteet-service';

const createLaskentaURL = async ({
  laskentaTyyppi,
  haku,
  hakukohteet,
  valinnanvaiheTyyppi,
  valinnanvaiheNumero,
  valintaryhma,
}: {
  laskentaTyyppi: LaskentaTyyppi;
  haku: Haku;
  hakukohteet: Array<Hakukohde> | null;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  valinnanvaiheNumero?: number;
  valintaryhma?: ValintaryhmaHakukohteilla;
}): Promise<URL> => {
  const configuration = getConfiguration();
  const singleHakukohde = only(hakukohteet ?? []);

  // Jos lasketaan koko haku, ei tarvitse antaa whitelist-parametria
  const urlWhitelistPart = laskentaTyyppi === 'HAKU' ? '' : '/whitelist/true';

  const laskentaUrl = new URL(
    `${configuration.routes.valintalaskentaLaskentaService.valintalaskentakerrallaUrl}/haku/${haku.oid}/tyyppi/${laskentaTyyppi}${urlWhitelistPart}`,
  );
  laskentaUrl.searchParams.set('haunnimi', translateName(haku.nimi));
  laskentaUrl.searchParams.set(
    'nimi',
    valintaryhma
      ? valintaryhma.nimi
      : singleHakukohde
        ? getFullnameOfHakukohde(singleHakukohde, translateName)
        : '',
  );
  if (
    valinnanvaiheNumero &&
    valinnanvaiheTyyppi !== ValinnanvaiheTyyppi.VALINTAKOE
  ) {
    laskentaUrl.searchParams.set('valinnanvaihe', '' + valinnanvaiheNumero);
  }
  if (valinnanvaiheTyyppi === ValinnanvaiheTyyppi.VALINTAKOE) {
    laskentaUrl.searchParams.set('valintakoelaskenta', 'true');
  }
  if (valintaryhma) {
    laskentaUrl.searchParams.set('valintaryhma', valintaryhma.oid);
  }
  return laskentaUrl;
};

type LaskentaStatusResponseData = {
  latausUrl: string;
  lisatiedot: {
    luotiinkoUusiLaskenta: boolean;
  };
};

export type LaskentaTyyppi = 'HAKU' | 'HAKUKOHDE' | 'VALINTARYHMA';

export const kaynnistaLaskenta = async ({
  haku,
  hakukohteet,
  valintaryhma,
  valinnanvaiheTyyppi,
  valinnanvaiheNumero,
}: {
  haku: Haku;
  hakukohteet: Array<Hakukohde> | null;
  valintaryhma?: ValintaryhmaHakukohteilla;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  valinnanvaiheNumero?: number;
}): Promise<StartedLaskentaInfo> => {
  let laskentaTyyppi: LaskentaTyyppi = 'HAKU';
  if (valintaryhma) {
    laskentaTyyppi = 'VALINTARYHMA';
  } else if (isNonNull(hakukohteet)) {
    laskentaTyyppi = 'HAKUKOHDE';
  }

  const laskentaUrl = await createLaskentaURL({
    laskentaTyyppi,
    haku,
    hakukohteet,
    valinnanvaiheTyyppi,
    valinnanvaiheNumero,
    valintaryhma,
  });
  const response = await client.post<LaskentaStatusResponseData>(
    laskentaUrl,
    hakukohteet?.map(prop('oid')) ?? '',
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
  const configuration = getConfiguration();
  await client.delete<void>(
    `${configuration.routes.valintalaskentaLaskentaService.valintalaskentakerrallaUrl}/haku/${laskentaUuid}`,
  );
};

export const getLaskennanYhteenveto = async (
  loadingUrl: string,
): Promise<LaskentaSummary> => {
  const configuration = getConfiguration();
  const response = await client.get<LaskentaSummary>(
    `${configuration.routes.valintalaskentaLaskentaService.valintalaskentakerrallaUrl}/status/${loadingUrl}/yhteenveto`,
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
  const configuration = getConfiguration();
  const response = await client.get<
    Array<ValintalaskennanTulosValinnanvaiheModel>
  >(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .hakukohteenValintalaskennanTuloksetUrl,
      { hakukohdeOid },
    ),
  );
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
  const configuration = getConfiguration();
  const response = await client.get<HakemuksenValintalaskennanTuloksetModel>(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .hakemuksenValintalaskennanTuloksetUrl,
      {
        hakuOid,
        hakemusOid,
      },
    ),
  );
  return pipe(
    response.data.hakukohteet,
    indexBy(prop('oid')),
    mapValues(prop('valinnanvaihe')),
  );
};

export const getLaskennanSeurantaTiedot = async (loadingUrl: string) => {
  const configuration = getConfiguration();
  const response = await client.get<SeurantaTiedot>(
    `${configuration.routes.valintalaskentaLaskentaService.seurantaUrl}${loadingUrl}`,
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
  jonoSijoitellaan: boolean;
};

export const muutaSijoittelunStatus = async ({
  jono,
  jonoSijoitellaan,
}: {
  jono: Pick<
    LaskennanValintatapajonoTulosWithHakijaInfo,
    'oid' | 'prioriteetti'
  >;
  jonoSijoitellaan: boolean;
}) => {
  const configuration = getConfiguration();
  const valintatapajonoOid = jono.oid;

  const updatedJono =
    await siirraTaiPoistaValintatapajonoAutomaattisestaSijoittelusta(
      valintatapajonoOid,
      jonoSijoitellaan,
    );

  if (updatedJono.prioriteetti === -1) {
    // A query for a single jono doesn't return a true prioriteetti value, but -1 as a placeholder, so let's re-set the value
    updatedJono.prioriteetti = jono.prioriteetti;
  }

  const { data } = await client.put<Array<MuutaSijoitteluaResponse>>(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .valmisSijoiteltavaksiUrl,
      { valintatapajonoOid, status: jonoSijoitellaan },
    ),
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
  const configuration = getConfiguration();
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
  >(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .hakukohdeHakijaryhmatUrl,
      { hakukohdeOid },
    ),
  );
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

const sijoittelunTilaOrdinalForHakemus = (tila: ValinnanTila): number => {
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
}: KoutaOidParams) => {
  const configuration = getConfiguration();
  const { data } = await client.get<Array<HarkinnanvaraisestiHyvaksytty>>(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .getHarkinnanvaraisetTilatUrl,
      { hakuOid, hakukohdeOid },
    ),
  );
  return data;
};

export const saveHarkinnanvaraisetTilat = async (
  harkinnanvaraisetTilat: Array<
    Omit<HarkinnanvaraisestiHyvaksytty, 'harkinnanvaraisuusTila'> & {
      harkinnanvaraisuusTila: HarkinnanvarainenTila | undefined;
    }
  >,
) => {
  const configuration = getConfiguration();
  return client.post<unknown>(
    configuration.routes.valintalaskentaLaskentaService
      .setHarkinnanvaraisetTilatUrl,
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

type JarjestyskriteeriChangeResult = KoutaOidParams & {
  valintatapajonoOid: string;
  hakemusOid: string;
  harkinnanvarainen: boolean | null;
  jarjestyskriteerit: Array<{
    arvo: number;
    tila: ValinnanTila;
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
  const configuration = getConfiguration();
  return client.post<JarjestyskriteeriChangeResult>(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .jarjestyskriteeriMuokkausUrl,
      {
        valintatapajonoOid,
        hakemusOid,
        jarjestyskriteeriPrioriteetti,
      },
    ),
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
  const configuration = getConfiguration();
  return client.delete<JarjestyskriteeriChangeResult>(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .jarjestyskriteeriMuokkausUrl,
      {
        valintatapajonoOid,
        hakemusOid,
        jarjestyskriteeriPrioriteetti,
      },
    ),
  );
};

export const saveValinnanvaiheTulokset = ({
  hakukohde,
  valinnanvaihe,
}: {
  hakukohde: Pick<Hakukohde, 'oid' | 'tarjoajaOid'>;
  valinnanvaihe: ValintalaskennanTulosValinnanvaiheModel;
}) => {
  const configuration = getConfiguration();
  const url = new URL(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService
        .hakukohteenValintalaskennanTuloksetUrl,
      {
        hakukohdeOid: hakukohde.oid,
      },
    ),
  );

  url.searchParams.set('tarjoajaOid', hakukohde.tarjoajaOid);
  return client.post<ValintalaskennanTulosValinnanvaiheModel>(
    url,
    valinnanvaihe,
  );
};

export const getLasketutHakukohteet = async (
  hakuOid: string,
): Promise<Array<LaskettuHakukohde>> => {
  const configuration = getConfiguration();
  const { data } = await client.get<
    Array<{ hakukohdeOid: string; lastModified: string }>
  >(
    getConfigUrl(
      configuration.routes.valintalaskentaLaskentaService.lasketutHakukohteet,
      {
        hakuOid,
      },
    ),
  );
  return data.map(({ hakukohdeOid, lastModified }) => ({
    hakukohdeOid,
    laskentaValmistunut: toFormattedDateTimeString(lastModified),
  }));
};
