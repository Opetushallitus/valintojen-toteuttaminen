'use client';

import { indexBy, isNullish, pick, prop } from 'remeda';
import { configuration } from '../configuration';
import { client } from '../http-client';
import {
  SijoitteluajonTulokset,
  SijoittelunHakemus,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  SijoittelunValintatapajonoTulos,
  VastaanottoTila,
} from '../types/sijoittelu-types';
import { nullWhen404, OphApiError } from '../common';
import {
  HakemusChangeEvent,
  HakijanVastaanottoTila,
  SijoitteluajonTuloksetResponseData,
  SijoitteluajonTuloksetWithValintaEsitysResponseData,
  SijoittelunTulosBasicInfo,
  ValinnanTulosModel,
  ValinnanTulosUpdateErrorResult,
} from './valinta-tulos-types';
import { toFormattedDateTimeString } from '../localization/translation-utils';
import { queryOptions } from '@tanstack/react-query';
import { KoutaOidParams } from '../kouta/kouta-types';

type SijoittelunTulosResponseData = {
  valintatapajonoNimi: string;
  valintatapajonoOid: string;
  sijoittelunKayttamatAloituspaikat: number;
  aloituspaikat: number;
  hyvaksytyt: number;
  ehdollisestiVastaanottaneet: number;
  paikanVastaanottaneet: number;
  varasijoilla: number;
  alinHyvaksyttyPistemaara: number;
  ehdollisestiHyvaksytyt: number;
  peruneet: number;
  harkinnanvaraisestiHyvaksytty: number;
};

export const getSijoittelunTulokset = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<Array<SijoittelunValintatapajonoTulos>> => {
  const response = await client.get<Array<SijoittelunTulosResponseData>>(
    `${configuration.valintaTulosServiceUrl}sijoitteluntulos/yhteenveto/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  const jsonTulokset: Array<SijoittelunValintatapajonoTulos> =
    response.data?.map((tulos) => {
      return {
        nimi: tulos.valintatapajonoNimi,
        oid: tulos.valintatapajonoOid,
        sijoittelunAloituspaikat: `${tulos.sijoittelunKayttamatAloituspaikat}/${tulos.aloituspaikat}`,
        hyvaksytty: tulos.hyvaksytyt,
        ehdollisestiHyvaksytty: tulos.ehdollisestiHyvaksytyt,
        harkinnanvaraisestiHyvaksytty: tulos.harkinnanvaraisestiHyvaksytty,
        varasijoilla: tulos.varasijoilla,
        vastaanottaneet: tulos.paikanVastaanottaneet,
        paikanPeruneet: tulos.peruneet,
        pisteraja: tulos.alinHyvaksyttyPistemaara,
      };
    });
  return jsonTulokset;
};

export const getLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) =>
  queryOptions({
    queryKey: [
      'getLatestSijoitteluajonTuloksetWithValintaEsitys',
      hakuOid,
      hakukohdeOid,
    ],
    queryFn: () =>
      getLatestSijoitteluajonTuloksetWithValintaEsitys(hakuOid, hakukohdeOid),
  });

export const getLatestSijoitteluajonTuloksetWithValintaEsitys = async (
  hakuOid: string,
  hakukohdeOid: string,
) => {
  const response = await nullWhen404(
    client.get<SijoitteluajonTuloksetWithValintaEsitysResponseData>(
      `${configuration.valintaTulosServiceUrl}sijoitteluntulos/${hakuOid}/sijoitteluajo/latest/hakukohde/${hakukohdeOid}`,
    ),
  );
  return response ? response.data : null;
};

export const getLatestSijoitteluAjonTuloksetForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<SijoitteluajonTulokset> => {
  const { data } = await client.get<SijoitteluajonTuloksetResponseData>(
    `${configuration.valintaTulosServiceUrl}sijoittelu/${hakuOid}/sijoitteluajo/latest/hakukohde/${hakukohdeOid}`,
  );

  const sijoitteluajonTulokset = data.valintatapajonot.map((jono) => {
    const hakemukset: Array<SijoittelunHakemus> = jono.hakemukset.map((h) => {
      return {
        hakijaOid: h.hakijaOid,
        hakemusOid: h.hakemusOid,
        pisteet: h.pisteet,
        tila: h.tila,
        valintatapajonoOid: h.valintatapajonoOid,
        hyvaksyttyHakijaryhmista: h.hyvaksyttyHakijaryhmista,
        varasijanNumero: h.varasijanNumero,
      };
    });
    return {
      oid: jono.oid,
      nimi: jono.nimi,
      hakemukset,
      prioriteetti: jono.prioriteetti,
    };
  });
  const hakijaryhmat = data.hakijaryhmat.map((ryhma) => {
    return { oid: ryhma.oid, kiintio: ryhma.kiintio };
  });
  return { valintatapajonot: sijoitteluajonTulokset, hakijaryhmat };
};

type SijoittelunHakutoiveenValintatapajonoModel = {
  tila: SijoittelunTila;
  pisteet: number;
  valintatapajonoOid: string;
  varasijanNumero: number;
  jonosija: number;
  tasasijaJonosija: number;
  valintatapajonoPrioriteetti: number;
  hyvaksyttyHarkinnanvaraisesti: boolean;
  ilmoittautumisTila: string;
};

type SijoitteluajonTulosHakutoiveModel = {
  hakutoive: number;
  hakukohdeOid: string;
  vastaanottotieto: VastaanottoTila;
  hakijaryhmat: Array<{ oid: string; kiintio: number }>;
  hakutoiveenValintatapajonot: Array<SijoittelunHakutoiveenValintatapajonoModel>;
};

type SijoitteluajonTuloksetForHakemusResponseData = {
  hakutoiveet: Array<SijoitteluajonTulosHakutoiveModel>;
};

export const getLatestSijoitteluajonTuloksetForHakemus = async ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const res = await nullWhen404(
    client.get<SijoitteluajonTuloksetForHakemusResponseData>(
      configuration.hakemuksenSijoitteluajonTuloksetUrl({
        hakuOid,
        hakemusOid,
      }),
    ),
  );

  return res ? indexBy(res.data.hakutoiveet, prop('hakukohdeOid')) : {};
};

export const saveMaksunTilanMuutokset = async (
  hakukohdeOid: string,
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>,
  originalHakemukset: Array<SijoittelunHakemusValintatiedoilla>,
) => {
  const hakemuksetWithChangedMaksunTila = hakemukset
    .filter((h) => {
      const original = originalHakemukset.find(
        (o) => o.hakemusOid === h.hakemusOid,
      );
      return original?.maksunTila !== h.maksunTila;
    })
    .map((h) => ({ personOid: h.hakijaOid, maksuntila: h.maksunTila }));

  if (hakemuksetWithChangedMaksunTila.length > 0) {
    await client.post(
      `${configuration.valintaTulosServiceUrl}lukuvuosimaksu/${hakukohdeOid}`,
      hakemuksetWithChangedMaksunTila,
    );
  }
};

const pickValinnanTulosProps = (value: Partial<ValinnanTulosModel>) =>
  pick(value, [
    'hakukohdeOid',
    'valintatapajonoOid',
    'hakemusOid',
    'henkiloOid',
    'vastaanottotila',
    'valinnantila',
    'ilmoittautumistila',
    'julkaistavissa',
    'ehdollisestiHyvaksyttavissa',
    'ehdollisenHyvaksymisenEhtoKoodi',
    'ehdollisenHyvaksymisenEhtoFI',
    'ehdollisenHyvaksymisenEhtoSV',
    'ehdollisenHyvaksymisenEhtoEN',
    'hyvaksyttyVarasijalta',
    'hyvaksyPeruuntunut',
  ]);

export const saveValinnanTulokset = async ({
  valintatapajonoOid,
  lastModified,
  tulokset,
}: {
  valintatapajonoOid: string;
  lastModified: Date | string | null;
  tulokset: Array<Partial<ValinnanTulosModel>>;
}) => {
  const ifUnmodifiedSince = (
    lastModified ? new Date(lastModified) : new Date()
  ).toUTCString();

  const results = await client.patch<Array<ValinnanTulosUpdateErrorResult>>(
    configuration.valinnanTulosMuokkausUrl({ valintatapajonoOid }),
    tulokset.map(pickValinnanTulosProps),
    {
      headers: { 'X-If-Unmodified-Since': ifUnmodifiedSince },
    },
  );

  const { data } = results;

  if (Array.isArray(data) && data.length > 0) {
    throw new OphApiError<Array<ValinnanTulosUpdateErrorResult>>(
      results,
      'virhe.tallennus',
    );
  }

  return data;
};

export const saveSijoitteluAjonTulokset = async (
  valintatapajonoOid: string,
  hakukohdeOid: string,
  lastModified: string,
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>,
) => {
  const valintaTulokset = hakemukset.map((h) => {
    return {
      hakukohdeOid,
      valintatapajonoOid,
      hakemusOid: h.hakemusOid,
      henkiloOid: h.hakijaOid,
      vastaanottotila: h.vastaanottoTila,
      ilmoittautumistila: h.ilmoittautumisTila,
      valinnantila: h.valinnanTila,
      julkaistavissa: h.julkaistavissa,
      ehdollisestiHyvaksyttavissa: h.ehdollisestiHyvaksyttavissa,
      ehdollisenHyvaksymisenEhtoKoodi: h.ehdollisenHyvaksymisenEhtoKoodi,
      ehdollisenHyvaksymisenEhtoFI: h.ehdollisenHyvaksymisenEhtoFI,
      ehdollisenHyvaksymisenEhtoSV: h.ehdollisenHyvaksymisenEhtoSV,
      ehdollisenHyvaksymisenEhtoEN: h.ehdollisenHyvaksymisenEhtoEN,
      hyvaksyttyVarasijalta: h.hyvaksyttyVarasijalta,
      hyvaksyPeruuntunut: h.hyvaksyPeruuntunut,
    };
  });

  await saveValinnanTulokset({
    valintatapajonoOid,
    lastModified: lastModified,
    tulokset: valintaTulokset,
  });

  const muuttuneetKirjeet = hakemukset.map((h) => {
    return {
      henkiloOid: h.hakijaOid,
      hakukohdeOid: hakukohdeOid,
      lahetetty: h.hyvaksymiskirjeLahetetty ?? null,
    };
  });
  await client.post<unknown>(
    `${configuration.valintaTulosServiceUrl}hyvaksymiskirje`,
    muuttuneetKirjeet,
  );
};

export const hyvaksyValintaEsitys = async (valintatapajonoOid: string) => {
  await client.post(
    `${configuration.valintaTulosServiceUrl}valintaesitys/${valintatapajonoOid}/hyvaksytty`,
    {},
  );
};

export type HakukohteenValinnanTuloksetData = {
  lastModified?: string;
  data: Record<string, ValinnanTulosModel>;
};

export const getHakukohteenValinnanTuloksetQueryOptions = (
  params: KoutaOidParams,
) =>
  queryOptions({
    queryKey: [
      'getHakukohteenValinnanTulokset',
      params.hakuOid,
      params.hakukohdeOid,
    ],
    queryFn: () => getHakukohteenValinnanTulokset(params),
  });

export const getHakukohteenValinnanTulokset = async (
  params: KoutaOidParams,
): Promise<HakukohteenValinnanTuloksetData> => {
  const { data, headers } = await client.get<Array<ValinnanTulosModel>>(
    configuration.hakukohteenValinnanTulosUrl(params),
  );
  return {
    lastModified: headers.get('X-Last-Modified') ?? undefined,
    data: indexBy(data ?? [], prop('hakemusOid')),
  };
};

export const getHakemuksenValinnanTulokset = async ({
  hakemusOid,
}: {
  hakemusOid: string;
}) => {
  const { data, headers } = await client.get<
    Array<{ valinnantulos: ValinnanTulosModel }>
  >(configuration.hakemuksenValinnanTulosUrl({ hakemusOid }));
  return {
    lastModified: headers.get('X-Last-Modified'),
    data: indexBy(data.map(prop('valinnantulos')), prop('hakukohdeOid')),
  };
};

export const sendVastaanottopostiHakemukselle = async (
  hakemusOid: string,
): Promise<Array<string>> => {
  const response = await client.post(
    `${configuration.vastaanottopostiHakemukselleUrl({ hakemusOid })}`,
    { hakemusOid },
  );
  return response.data as Array<string>;
};

export const sendVastaanottopostiHakukohteelle = async (
  hakukohdeOid: string,
): Promise<Array<string>> => {
  const response = await client.post(
    `${configuration.vastaanottopostiHakukohteelleUrl({ hakukohdeOid })}`,
    { hakukohdeOid },
  );
  return response.data as Array<string>;
};

export const sendVastaanottopostiValintatapaJonolle = async (
  hakukohdeOid: string,
  valintatapajonoOid: string,
): Promise<Array<string>> => {
  const response = await client.post<Array<string>>(
    configuration.vastaanottopostiJonolleUrl({
      hakukohdeOid,
      valintatapajonoOid,
    }),
    { hakukohdeOid, jonoOid: valintatapajonoOid },
  );
  return response.data;
};

type ChangeHistoryEventResponse = {
  timestamp: string;
  changes: [
    {
      field: string;
      from: string | boolean;
      to: string | boolean;
    },
  ];
};

export const changeHistoryForHakemus = async (
  hakemusOid: string,
  valintatapajonoOid: string,
): Promise<Array<HakemusChangeEvent>> => {
  const response = await client.get<Array<ChangeHistoryEventResponse>>(
    configuration.muutoshistoriaHakemukselleUrl({
      hakemusOid,
      valintatapajonoOid,
    }),
  );
  return response.data.map((ce, index) => {
    const changes = ce.changes.filter(
      (c) => c.field !== 'valinnantilanViimeisinMuutos',
    );
    return {
      rowKey: `${index}-${ce.timestamp}`,
      changeTimeUnformatted: ce.timestamp,
      changeTime: toFormattedDateTimeString(ce.timestamp),
      changes,
    };
  });
};

export const hakijoidenVastaanottotilatValintatapajonolle = async (
  hakuOid: string,
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemusOids: Array<string>,
): Promise<Array<HakijanVastaanottoTila>> => {
  const response = await client.post<
    Array<{
      valintatapajonoOid: string;
      hakemusOid: string;
      tilaHakijalle: string;
    }>
  >(
    configuration.hakijanTilatValintatapajonolleUrl({
      hakuOid,
      hakukohdeOid,
      valintatapajonoOid,
    }),
    hakemusOids,
  );
  return response.data.map((hvt) => ({
    valintatapaJonoOid: hvt.valintatapajonoOid,
    vastaanottotila: hvt.tilaHakijalle as VastaanottoTila,
    hakemusOid: hvt.hakemusOid,
  }));
};

export async function getSijoittelunTuloksenPerustiedotHaulle(
  hakuOid: string,
): Promise<SijoittelunTulosBasicInfo | null> {
  const response = await nullWhen404(
    client.get<{ startMils: number; endMils: number }>(
      configuration.sijoittelunTuloksenPerustiedotHaulleUrl({ hakuOid }),
    ),
  );
  return isNullish(response)
    ? null
    : {
        startDate: new Date(response.data.startMils),
        endDate: new Date(response.data.endMils),
      };
}
