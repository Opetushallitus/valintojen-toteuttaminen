import { Haku, Hakukohde, getFullnameOfHakukohde } from './types/kouta-types';
import { configuration } from './configuration';
import { ValinnanvaiheTyyppi } from './types/valintaperusteet-types';
import { client } from './http-client';
import { TranslatedName } from './localization/localization-types';
import { HenkilonValintaTulos } from './types/sijoittelu-types';
import {
  HakemuksenPistetiedot,
  HakukohteenPistetiedot,
  LaskentaErrorSummary,
  LaskentaStart,
  ValintakoeOsallistuminen,
  ValintakokeenPisteet,
} from './types/laskenta-types';
import { getHakemukset } from './ataru';
import { getValintakokeet } from './valintaperusteet';
import {
  flatMap,
  indexBy,
  isEmpty,
  isNonNullish,
  mapValues,
  pipe,
} from 'remeda';
import { EMPTY_ARRAY } from './common';

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
      `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
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
      `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
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
    `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/status/${loadingUrl}/yhteenveto`,
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

export const getHakukohteenValintatuloksetIlmanHakijanTilaa = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HenkilonValintaTulos[]> => {
  const { data } = await client.get<Array<{ tila: string; hakijaOid: string }>>(
    `${configuration.valintalaskentaKoostePalveluUrl}proxy/valintatulosservice/ilmanhakijantilaa/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  return data.map((t) => {
    return { tila: t.tila, hakijaOid: t.hakijaOid };
  });
};

export const getScoresForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HakukohteenPistetiedot> => {
  const kokeet = await getValintakokeet(hakukohdeOid);

  if (isEmpty(kokeet)) {
    return { hakemukset: EMPTY_ARRAY, valintakokeet: EMPTY_ARRAY };
  }

  const [hakemukset, { data: pistetiedot }] = await Promise.all([
    getHakemukset(hakuOid, hakukohdeOid),
    client.get<{
      lastModified?: string;
      valintapisteet: Array<{
        applicationAdditionalDataDTO: {
          oid: string;
          personOid: string;
          additionalData: Record<string, string>;
        };
      }>;
    }>(configuration.koostetutPistetiedot({ hakuOid, hakukohdeOid })),
  ]);
  const hakemuksetIndexed = indexBy(hakemukset, (h) => h.hakemusOid);

  const hakemuksetKokeilla: HakemuksenPistetiedot[] =
    pistetiedot.valintapisteet.map(
      (p: {
        applicationAdditionalDataDTO: {
          oid: string;
          personOid: string;
          additionalData: Record<string, string>;
        };
      }) => {
        const hakemus = hakemuksetIndexed[p.applicationAdditionalDataDTO.oid];
        const kokeenPisteet: ValintakokeenPisteet[] = kokeet.map((k) => {
          const arvo =
            p.applicationAdditionalDataDTO.additionalData[k.tunniste];
          const osallistuminen = p.applicationAdditionalDataDTO.additionalData[
            k.osallistuminenTunniste
          ] as ValintakoeOsallistuminen;
          return {
            tunniste: k.tunniste,
            arvo,
            osallistuminen,
            osallistuminenTunniste: k.osallistuminenTunniste,
          };
        });
        return {
          hakemusOid: hakemus.hakemusOid,
          hakijaOid: hakemus.hakijaOid,
          hakijanNimi: hakemus.hakijanNimi,
          etunimet: hakemus.etunimet,
          sukunimi: hakemus.sukunimi,
          valintakokeenPisteet: kokeenPisteet,
        };
      },
    );

  const lastModified = isNonNullish(pistetiedot.lastModified)
    ? new Date(pistetiedot.lastModified)
    : undefined;
  return {
    lastModified,
    valintakokeet: kokeet,
    hakemukset: hakemuksetKokeilla,
  };
};

export const updateScoresForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
  pistetiedot: HakemuksenPistetiedot[],
) => {
  const mappedPistetiedot = pistetiedot.map((p) => {
    const additionalData = pipe(
      p.valintakokeenPisteet,
      flatMap((vp) => [
        { key: vp.tunniste, value: vp.arvo },
        { key: vp.osallistuminenTunniste, value: vp.osallistuminen },
      ]),
      indexBy((kv) => kv.key),
      mapValues((val) => val.value),
    );
    return {
      oid: p.hakemusOid,
      personOid: p.hakijaOid,
      firstNames: p.etunimet,
      lastName: p.sukunimi,
      additionalData,
    };
  });
  await client.put(
    configuration.koostetutPistetiedot({ hakuOid, hakukohdeOid }),
    mappedPistetiedot,
  );
};

export type Osallistuminen =
  | 'OSALLISTUU'
  | 'EI_OSALLISTU'
  | 'EI_VAADITA'
  | 'VIRHE';

export const getValintakoeTulokset = async (hakukohdeOid: string) => {
  const response = await client.get<
    Array<{
      hakuOid: string;
      hakemusOid: string;
      hakijaOid: string;
      createdAt: string;
      hakutoiveet: Array<{
        hakukohdeOid: string;
        valinnanVaiheet: Array<{
          valinnanVaiheOid: string;
          valinnanVaiheJarjestysluku: number;
          valintakokeet: Array<{
            valintakoeOid: string;
            valintakoeTunniste: string;
            nimi: string;
            aktiivinen: boolean;
            lahetetaankoKoekutsut: boolean;
            osallistuminenTulos: {
              osallistuminen: Osallistuminen;
              kuvaus: {
                FI?: string;
                SV?: string;
                EN?: string;
              };
            };
          }>;
        }>;
      }>;
    }>
  >(configuration.valintakoeTuloksetUrl({ hakukohdeOid }));
  return response.data;
};

export type GetValintakoeExcelParams = {
  hakuOid: string;
  hakukohdeOid: string;
  hakemusOids?: Array<string>;
  valintakoeTunniste: string;
};

const getContentFilename = (headers: Headers) => {
  const contentDisposition = headers.get('content-disposition');
  return contentDisposition?.match(/^attachment; filename="(.*)"$/)?.[1];
};

const downloadProcessDocument = async (processId: string) => {
  const processRes = await client.get<{
    dokumenttiId: string;
    kasittelyssa: boolean;
    keskeytetty: false;
    kokonaistyo: {
      valmis: boolean;
    };
  }>(configuration.dokumenttiProsessiUrl({ id: processId }));
  const dokumenttiId = processRes?.data?.dokumenttiId;

  return {
    fileName: getContentFilename(processRes.headers),
    blob: (
      await client.get<Blob>(configuration.lataaDokumenttiUrl({ dokumenttiId }))
    )?.data,
  };
};

export const getValintakoeExcel = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  valintakoeTunniste,
}: GetValintakoeExcelParams) => {
  const urlWithQuery = new URL(configuration.createValintakoeExcelUrl);
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);

  const createResponse = await client.post<{ id: string }>(urlWithQuery, {
    hakemusOids,
    valintakoeTunnisteet: [valintakoeTunniste],
  });
  const excelProcessId = createResponse?.data?.id;
  return await downloadProcessDocument(excelProcessId);
};

export const getValintakoeOsoitetarrat = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  valintakoeTunniste,
}: GetValintakoeExcelParams) => {
  const urlWithQuery = new URL(configuration.createValintakoeOsoitetarratUrl);
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);
  urlWithQuery.searchParams.append('valintakoeTunniste', valintakoeTunniste);

  const createResponse = await client.post<{ id: string }>(urlWithQuery, {
    hakemusOids,
    tag: 'valintakoetulos',
  });
  const tarratProcessId = createResponse?.data?.id;
  return await downloadProcessDocument(tarratProcessId);
};
