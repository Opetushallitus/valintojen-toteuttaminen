import {
  abortableClient,
  client,
  createFileResult,
  FileResult,
} from '../http-client';
import {
  HenkilonValintaTulos,
  VastaanottoTila,
} from '../types/sijoittelu-types';
import {
  HakemuksenPistetiedot,
  HakukohteenPistetiedot,
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '../types/laskenta-types';
import {
  difference,
  flatMap,
  indexBy,
  isEmpty,
  isNonNullish,
  isNullish,
  mapValues,
  pipe,
  prop,
} from 'remeda';
import {
  OphApiError,
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  OphProcessError,
  OphProcessErrorData,
  nullWhen404,
  isOphOid,
} from '../common';
import { getHakemukset, getHakijat } from '../ataru/ataru-service';
import {
  getValintakokeet,
  getValintakoeAvaimetHakukohteelle,
  getValintakoeAvaimetHakukohteille,
} from '../valintaperusteet/valintaperusteet-service';
import { ValintakoekutsutData } from '../types/valintakoekutsut-types';
import {
  DokumenttiTyyppi,
  HakukohteidenSuodatustiedot,
  HakutoiveValintakoeOsallistumiset,
  Kirjepohja,
  KirjepohjaNimi,
  LetterCounts,
} from './valintalaskentakoostepalvelu-types';
import { HarkinnanvaraisuudenSyy } from '../types/harkinnanvaraiset-types';
import { ValintakoeAvaimet } from '../valintaperusteet/valintaperusteet-types';
import { Haku, Hakukohde, KoutaOidParams } from '../kouta/kouta-types';
import { getOpetuskieliCode, isKorkeakouluHaku } from '../kouta/kouta-service';
import {
  INPUT_DATE_FORMAT,
  INPUT_TIME_FORMAT,
  toFormattedDateTimeString,
  translateName,
} from '../localization/translation-utils';
import { AssertionError } from 'assert';
import { queryOptions } from '@tanstack/react-query';
import { Language } from '../localization/localization-types';
import {
  HakemuksenValinnanTulos,
  HakijanVastaanottoTila,
} from '../valinta-tulos-service/valinta-tulos-types';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from '../configuration/configuration-utils';

export const getHakukohteenValintatuloksetIlmanHakijanTilaa = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<Array<HenkilonValintaTulos>> => {
  const configuration = getConfiguration();
  const { data } = await client.get<Array<{ tila: string; hakijaOid: string }>>(
    `${configuration.routes.valintalaskentakoostepalvelu.valintalaskentaKoostePalveluUrl}proxy/valintatulosservice/ilmanhakijantilaa/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  return data.map((t) => {
    return { tila: t.tila, hakijaOid: t.hakijaOid };
  });
};

type PistetietoItem = {
  applicationAdditionalDataDTO: {
    oid: string;
    additionalData: Record<string, string>;
  };
  hakukohteidenOsallistumistiedot?: Record<
    string,
    {
      valintakokeidenOsallistumistiedot: Record<
        string,
        { osallistumistieto: ValintakoeOsallistuminenTulos }
      >;
    }
  >;
};

export type PisteetForHakemus = {
  lastmodified: string;
  hakukohteittain: Record<string, PistetietoItem>;
};

const getPisteetForHakemus = async ({ hakemusOid }: { hakemusOid: string }) => {
  const configuration = getConfiguration();
  const res = await client.get<PisteetForHakemus>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .koostetutPistetiedotHakemukselleUrl,
      { hakemusOid },
    ),
  );

  return res.data;
};

const selectKokeenPisteet = (
  hakukohdeOid: string,
  pistetieto: PistetietoItem,
  kokeet: Array<ValintakoeAvaimet>,
): Array<ValintakokeenPisteet> => {
  return kokeet
    .map((k) => {
      //osallistumistiedot on löydyttävä myös hakukohteidenOsallistumistiedoista jotta kokeen pisteitä näytettäis
      const osallistumisTiedot =
        pistetieto.hakukohteidenOsallistumistiedot?.[hakukohdeOid]
          ?.valintakokeidenOsallistumistiedot[k.tunniste]?.osallistumistieto;
      if (isNullish(osallistumisTiedot)) {
        return null;
      }
      const arvo =
        pistetieto.applicationAdditionalDataDTO.additionalData[k.tunniste];
      const osallistuminen = pistetieto.applicationAdditionalDataDTO
        .additionalData[
        k.osallistuminenTunniste
      ] as ValintakoeOsallistuminenTulos;
      return {
        tunniste: k.tunniste,
        arvo,
        osallistuminen: osallistuminen,
        osallistuminenTunniste: k.osallistuminenTunniste,
      };
    })
    .filter(isNonNullish);
};

export const getKoePisteetForHakemus = async ({
  hakemusOid,
  hakukohdeOids,
}: {
  hakemusOid: string;
  hakukohdeOids: Array<string>;
}): Promise<Record<string, Array<ValintakokeenPisteet>>> => {
  const kokeet = await getValintakoeAvaimetHakukohteille({ hakukohdeOids });
  const pistetiedot = await getPisteetForHakemus({ hakemusOid });

  return mapValues(pistetiedot.hakukohteittain, (p, hakukohdeOid) => {
    return selectKokeenPisteet(hakukohdeOid, p, kokeet[hakukohdeOid]);
  });
};

export const getPisteetForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HakukohteenPistetiedot> => {
  const configuration = getConfiguration();
  const kokeetPromise = getValintakoeAvaimetHakukohteelle(hakukohdeOid);
  const hakemuksetPromise = getHakemukset({ hakuOid, hakukohdeOid });
  const pisteTiedotFetch = abortableClient.get<{
    lastmodified?: string;
    valintapisteet: Array<PistetietoItem>;
  }>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .koostetutPistetiedotHakukohteelleUrl,
      {
        hakuOid,
        hakukohdeOid,
      },
    ),
  );

  let kokeet = await kokeetPromise;

  if (isEmpty(kokeet)) {
    pisteTiedotFetch.abort('Ei kokeita, perutaan pistetietojen haku');
    return { hakemukset: EMPTY_ARRAY, valintakokeet: EMPTY_ARRAY };
  }

  kokeet = kokeet.sort((a, b) => a.kuvaus.localeCompare(b.kuvaus));

  const [hakemukset, { data: pistetiedot }] = await Promise.all([
    hakemuksetPromise,
    pisteTiedotFetch.promise,
  ]);
  const hakemuksetIndexed = indexBy(hakemukset, prop('hakemusOid'));

  const hakemuksetKokeilla: Array<HakemuksenPistetiedot> =
    pistetiedot.valintapisteet.map((p: PistetietoItem) => {
      const hakemus = hakemuksetIndexed[p.applicationAdditionalDataDTO.oid];
      const kokeenPisteet: Array<ValintakokeenPisteet> = selectKokeenPisteet(
        hakukohdeOid,
        p,
        kokeet,
      );
      return {
        hakemusOid: hakemus.hakemusOid,
        hakijaOid: hakemus.hakijaOid,
        hakijanNimi: hakemus.hakijanNimi,
        etunimet: hakemus.etunimet,
        sukunimi: hakemus.sukunimi,
        valintakokeenPisteet: kokeenPisteet,
      };
    });

  const lastModified = isNonNullish(pistetiedot.lastmodified)
    ? new Date(pistetiedot.lastmodified)
    : undefined;
  return {
    lastModified,
    valintakokeet: kokeet,
    hakemukset: hakemuksetKokeilla,
  };
};

export const updatePisteetForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
  pistetiedot: Array<HakemuksenPistetiedot>,
) => {
  const configuration = getConfiguration();
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
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .koostetutPistetiedotHakukohteelleUrl,
      {
        hakuOid,
        hakukohdeOid,
      },
    ),
    mappedPistetiedot,
  );
};

const getValintakoeOsallistumiset = async ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) => {
  const configuration = getConfiguration();
  const response = await client.get<Array<HakutoiveValintakoeOsallistumiset>>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .valintakoeOsallistumisetUrl,
      { hakukohdeOid },
    ),
  );
  return response.data;
};

const VALINTAKOKEET_EMPTY_RESPONSE = {
  valintakokeet: EMPTY_ARRAY,
  hakemuksetByOid: EMPTY_OBJECT,
  valintakoeOsallistumiset: EMPTY_ARRAY,
} as const;

async function getAndCombineValintakoekutsutData({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams): Promise<ValintakoekutsutData> {
  const valintakokeet = await getValintakokeet(hakukohdeOid);

  if (isEmpty(valintakokeet)) {
    return VALINTAKOKEET_EMPTY_RESPONSE;
  }

  const [valintakoeOsallistumiset, hakukohdeHakemukset] = await Promise.all([
    getValintakoeOsallistumiset({ hakukohdeOid }),
    getHakijat({ hakuOid, hakukohdeOid }),
  ]);
  const valintakoeHakemusOids = valintakoeOsallistumiset.map(
    prop('hakemusOid'),
  );
  const hakukohdeHakemusOids = hakukohdeHakemukset.map(prop('hakemusOid'));
  const missingHakemusOids = difference(
    valintakoeHakemusOids,
    hakukohdeHakemusOids,
  );

  let allHakemukset = hakukohdeHakemukset;

  if (!isEmpty(missingHakemusOids)) {
    const missingHakemukset = await getHakijat({
      hakemusOids: missingHakemusOids,
    });
    allHakemukset = hakukohdeHakemukset.concat(missingHakemukset);
  }

  const hakemuksetByOid = indexBy(allHakemukset, prop('hakemusOid'));

  return {
    valintakokeet,
    hakemuksetByOid,
    valintakoeOsallistumiset,
  };
}

export async function getValintakoekutsutData({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams): Promise<ValintakoekutsutData> {
  const response = await nullWhen404(
    getAndCombineValintakoekutsutData({ hakuOid, hakukohdeOid }),
  );
  return response ?? VALINTAKOKEET_EMPTY_RESPONSE;
}

export type GetValintakoeExcelParams = KoutaOidParams & {
  hakemusOids?: Array<string>;
  valintakoeTunniste: Array<string>;
};

export type ProcessResponse = {
  dokumenttiId: string;
  kasittelyssa: boolean;
  keskeytetty: boolean;
  kokonaistyo: {
    valmis: boolean;
  };
  poikkeukset: Array<{
    tunnisteet: Array<{
      oid?: string;
      tunniste: string;
      tyyppi: string;
    }>;
    palvelu: string;
    viesti: string;
    palvelukutsu: string;
  }>;
  varoitukset: Array<{
    oid: string;
    selite: string;
  }>;
};

function mapProcessResponseToErrorData(
  processRes: ProcessResponse,
): Array<OphProcessErrorData> {
  const warnings: Array<OphProcessErrorData> = processRes.varoitukset.map(
    (v) => ({ id: v.oid, message: v.selite }),
  );
  return processRes.poikkeukset
    .flatMap((p) => {
      const serviceError: Array<OphProcessErrorData> = [
        { id: p.palvelu, message: p.viesti, isService: true },
      ];
      return serviceError.concat(
        p.tunnisteet.map((t) => {
          if (t.oid) {
            return { id: t.oid, message: t.tunniste };
          } else if (isOphOid(t.tunniste)) {
            return { id: t.tunniste, message: p.viesti };
          }
          return { id: t.tyyppi, message: t.tunniste ?? p.viesti };
        }),
      );
    })
    .concat(warnings);
}

//TODO: poista tämä OK-800 yhteydessä ja käytä toista pollausfunktiota
const pollDocumentProcess = async (
  processId: string,
  infiniteWait: boolean,
) => {
  const configuration = getConfiguration();
  let pollTimes = 10;

  while (pollTimes || infiniteWait) {
    const processRes = await client.get<ProcessResponse>(
      getConfigUrl(
        configuration.routes.valintalaskentakoostepalvelu.dokumenttiProsessiUrl,
        {
          id: processId,
        },
      ),
    );
    pollTimes -= 1;

    const { data } = processRes;
    if (data.kokonaistyo?.valmis || data.keskeytetty) {
      return data;
    } else if (pollTimes === 0 && !infiniteWait) {
      throw new OphApiError(
        processRes,
        'Dokumentin prosessointi aikakatkaistiin',
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new AssertionError({
    message: 'Dokumentin prosessoinnin pollaus päättyi ilman tulosta!',
  });
};

const processDocumentAndReturnDocumentId = async (
  processId: string,
  infiniteWait: boolean = false,
) => {
  const data = await pollDocumentProcess(processId, infiniteWait);

  const { dokumenttiId, poikkeukset, varoitukset } = data;

  if (!isEmpty(poikkeukset) || !isEmpty(varoitukset)) {
    console.error(
      'Exception caught while processing document: ',
      (poikkeukset ?? [])
        .map(prop('viesti'))
        .concat((varoitukset ?? []).map((v) => `${v.oid}: ${v.selite}`))
        .join('\n'),
    );
    throw new OphProcessError(mapProcessResponseToErrorData(data));
  }

  return dokumenttiId;
};

export const downloadReadyProcessDocument = async (dokumenttiId: string) => {
  const configuration = getConfiguration();
  const documentRes = await client.get<Blob>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu.lataaDokumenttiUrl,
      {
        dokumenttiId,
      },
    ),
  );
  return createFileResult(documentRes);
};

const downloadProcessDocument = async (
  processId: string,
  infiniteWait: boolean = false,
) => {
  const dokumenttiId = await processDocumentAndReturnDocumentId(
    processId,
    infiniteWait,
  );
  return downloadReadyProcessDocument(dokumenttiId);
};

export const getValintakoeExcel = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  valintakoeTunniste,
}: GetValintakoeExcelParams & { valintakoeTunniste: Array<string> }) => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startExportValintakoeExcelUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);

  const createResponse = await client.post<{ id: string }>(urlWithQuery, {
    hakemusOids,
    valintakoeTunnisteet: valintakoeTunniste,
  });
  const excelProcessId = createResponse?.data?.id;
  return downloadProcessDocument(excelProcessId);
};

type GetValintakoeOsoitetarratParams = KoutaOidParams & {
  hakemusOids?: Array<string>;
  valintakoeTunniste: string;
};

export const getValintakoeOsoitetarrat = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  valintakoeTunniste,
}: GetValintakoeOsoitetarratParams) => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startExportValintakoeOsoitetarratUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);
  if (valintakoeTunniste) {
    urlWithQuery.searchParams.append('valintakoeTunniste', valintakoeTunniste);
  }

  const startProcessResponse = await client.post<{ id: string }>(urlWithQuery, {
    hakemusOids,
    tag: 'valintakoetulos',
  });
  const tarratProcessId = startProcessResponse?.data?.id;
  return downloadProcessDocument(tarratProcessId);
};

export const getOsoitetarratHakemuksille = async ({
  tag,
  hakemusOids,
}: {
  tag: string;
  hakemusOids: Array<string>;
}) => {
  const configuration = getConfiguration();
  const startProcessResponse = await client.post<{ id: string }>(
    configuration.routes.valintalaskentakoostepalvelu
      .startExportOsoitetarratHakemuksilleUrl,
    {
      hakemusOids,
      tag,
    },
  );
  const tarratProcessId = startProcessResponse?.data?.id;
  return downloadProcessDocument(tarratProcessId);
};

export const getOsoitetarratHaulle = async ({
  hakuOid,
}: {
  hakuOid: string;
}) => {
  const configuration = getConfiguration();
  const startProcessResponse = await client.post<{ id: string }>(
    `${configuration.routes.valintalaskentakoostepalvelu.startExportOsoitetarratHaulleUrl}?hakuOid=${hakuOid}`,
    '',
  );
  const tarratProcessId = startProcessResponse?.data?.id;
  return downloadProcessDocument(tarratProcessId);
};

export const getValintalaskennanTulosExcel = async ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) => {
  const configuration = getConfiguration();
  const excelRes = await client.get<Blob>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .valintalaskennanTulosExcelUrl,
      { hakukohdeOid },
    ),
  );
  return createFileResult(excelRes);
};

type ValintatapaJonoTulosExcelProps = KoutaOidParams & {
  valintatapajonoOid: string;
};

export const getValintatapajonoTulosExcel = async ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
}: ValintatapaJonoTulosExcelProps) => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startExportValintatapajonoTulosExcelUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);
  urlWithQuery.searchParams.append('valintatapajonoOid', valintatapajonoOid);

  const excelRes = await client.post<{ id: string }>(urlWithQuery, {});

  const excelProcessId = excelRes?.data?.id;

  return await downloadProcessDocument(excelProcessId);
};

const pollDocumentSeuranta = async (uuid: string) => {
  const configuration = getConfiguration();
  let pollTimes = 10;

  while (pollTimes) {
    const documentRes = await client.get<{
      uuid: string;
      kuvaus: string;
      valmis: boolean;
      virheilmoitukset: Array<{ tyyppi: string; ilmoitus: string }> | null;
      dokumenttiId: string | null;
      virheita: boolean;
    }>(
      getConfigUrl(
        configuration.routes.valintalaskentakoostepalvelu.dokumenttiSeurantaUrl,
        {
          uuid,
        },
      ),
    );
    pollTimes -= 1;
    const resData = documentRes.data;
    if (resData.valmis || resData.virheita) {
      if (resData.virheita) {
        throw new OphApiError(
          documentRes,
          resData.virheilmoitukset?.[0].ilmoitus,
        );
      }
      return {
        uuid,
        kuvaus: resData.kuvaus,
      };
    } else if (pollTimes === 0) {
      throw new OphApiError(documentRes, 'Dokumentin seuranta aikakatkaistiin');
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new AssertionError({
    message: 'Dokumentin seurannan pollaus päättyi ilman tulosta!',
  });
};

export const saveValintatapajonoTulosExcel = async ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
  file,
}: ValintatapaJonoTulosExcelProps & { file: File }) => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startImportValintatapajonoTulosExcelUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);
  urlWithQuery.searchParams.append('valintatapajonoOid', valintatapajonoOid);

  const res = await client.post<string>(
    urlWithQuery,
    await file.arrayBuffer(),
    {
      headers: {
        'content-type': 'application/octet-stream',
      },
    },
  );

  await pollDocumentSeuranta(res.data);
};

export const getPistesyottoExcel = async ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startExportPistesyottoExcelUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);
  const createResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    '',
  );
  const excelProcessId = createResponse?.data?.id;

  return await downloadProcessDocument(excelProcessId);
};

export const getSijoittelunTulosExcel = async ({
  hakuOid,
  hakukohdeOid,
  sijoitteluajoId,
}: KoutaOidParams & {
  sijoitteluajoId: string;
}) => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.sijoittelunTulosExcelUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);
  urlWithQuery.searchParams.append('sijoitteluajoId', sijoitteluajoId);
  const createResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    '',
  );
  const excelProcessId = createResponse?.data?.id;

  return await downloadProcessDocument(excelProcessId);
};

export const getSijoittelunTulosHaulleExcel = async (
  hakuOid: string,
): Promise<FileResult> => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.sijoittelunTulosHaulleExcelUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  const createResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    '',
  );
  const excelProcessId = createResponse?.data?.id;

  return await downloadProcessDocument(excelProcessId, true);
};

export const savePistesyottoExcel = async ({
  hakuOid,
  hakukohdeOid,
  excelFile,
}: KoutaOidParams & {
  excelFile: File;
}) => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startImportPistesyottoUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);

  const res = await client.post<
    Array<{ applicationOID: string; errorMessage: string }> | ''
  >(urlWithQuery.toString(), await excelFile.arrayBuffer(), {
    headers: {
      'content-type': 'application/octet-stream',
    },
  });

  const { data } = res;

  if (Array.isArray(data)) {
    throw new OphApiError(
      res,
      'pistesyotto.virhe-tuo-taulukkolaskennasta-epaonnistui-osittain',
    );
  }
  return data;
};

type HakemuksenHarkinnanvaraisuustiedot = {
  hakemusOid: string;
  hakutoiveet: Array<{
    hakukohdeOid: string;
    harkinnanvaraisuudenSyy: HarkinnanvaraisuudenSyy;
  }>;
};

export const getHarkinnanvaraisuudetHakemuksille = async ({
  hakemusOids,
}: {
  hakemusOids: Array<string>;
}) => {
  const configuration = getConfiguration();
  const res = await client.post<Array<HakemuksenHarkinnanvaraisuustiedot>>(
    configuration.routes.valintalaskentakoostepalvelu
      .harkinnanvaraisuudetHakemuksilleUrl,
    hakemusOids,
  );
  return res.data;
};

export const luoHyvaksymiskirjeetPDF = async ({
  hakemusOids,
  sijoitteluajoId,
  hakukohde,
  letterBody,
  deadline,
  onlyForbidden,
}: {
  hakemusOids?: Array<string>;
  sijoitteluajoId?: string;
  hakukohde: Hakukohde;
  letterBody: string;
  deadline?: Date | null;
  onlyForbidden: boolean;
}): Promise<string> => {
  const configuration = getConfiguration();
  const hakukohdeNimi = translateName(hakukohde.nimi);
  const opetuskieliCode = (getOpetuskieliCode(hakukohde) || 'fi').toUpperCase();
  const pvm = deadline
    ? toFormattedDateTimeString(deadline, INPUT_DATE_FORMAT)
    : null;
  const time = deadline
    ? toFormattedDateTimeString(deadline, INPUT_TIME_FORMAT)
    : null;
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.hyvaksymiskirjeetUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakukohde.hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohde.oid);
  if (sijoitteluajoId) {
    urlWithQuery.searchParams.append('sijoitteluajoId', sijoitteluajoId);
  }
  urlWithQuery.searchParams.append('tarjoajaOid', hakukohde.tarjoajaOid);
  urlWithQuery.searchParams.append('hakukohdeNimi', hakukohdeNimi);
  urlWithQuery.searchParams.append('lang', opetuskieliCode);
  urlWithQuery.searchParams.append('templateName', 'hyvaksymiskirje');
  urlWithQuery.searchParams.append('palautusPvm', '' + pvm);
  urlWithQuery.searchParams.append('palautusAika', '' + time);
  urlWithQuery.searchParams.append(
    'vainTulosEmailinKieltaneet',
    '' + onlyForbidden,
  );
  const body = {
    hakemusOids: hakemusOids,
    letterBodyText: letterBody,
    tag: hakukohde.oid,
  };
  const startProcessResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    body,
  );
  const kirjeetProcessId = startProcessResponse?.data?.id;
  return await processDocumentAndReturnDocumentId(kirjeetProcessId, true);
};

export const luoHyvaksymiskirjeetHaullePDF = async ({
  hakuOid,
  lang,
  templateName = 'hyvaksymiskirje',
}: {
  hakuOid: string;
  lang?: Language;
  templateName?: string;
}): Promise<FileResult> => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.hyvaksymiskirjeetUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('vainTulosEmailinKieltaneet', 'false');
  urlWithQuery.searchParams.append('templateName', templateName);
  if (isNonNullish(lang)) {
    urlWithQuery.searchParams.append('asiointikieli', lang.toUpperCase());
  }
  const startProcessResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    {
      tag: hakuOid,
      letterBodyText: '',
    },
  );
  const kirjeetProcessId = startProcessResponse?.data?.id;
  return downloadProcessDocument(kirjeetProcessId, true);
};

export const luoEiHyvaksymiskirjeetPDF = async ({
  sijoitteluajoId,
  hakukohde,
  letterBody,
}: {
  sijoitteluajoId: string;
  hakukohde: Hakukohde;
  letterBody: string;
}): Promise<string> => {
  const configuration = getConfiguration();
  const opetuskieliCode = (getOpetuskieliCode(hakukohde) || 'fi').toUpperCase();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.eihyvaksymiskirjeetUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakukohde.hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohde.oid);
  urlWithQuery.searchParams.append('sijoitteluajoId', sijoitteluajoId);
  urlWithQuery.searchParams.append('tarjoajaOid', hakukohde.tarjoajaOid);
  urlWithQuery.searchParams.append('lang', opetuskieliCode);
  urlWithQuery.searchParams.append('templateName', 'jalkiohjauskirje');
  const body = {
    hakemusOids: null,
    letterBodyText: letterBody,
    tag: hakukohde.oid,
  };
  const startProcessResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    body,
  );
  const kirjeetProcessId = startProcessResponse?.data?.id;
  return await processDocumentAndReturnDocumentId(kirjeetProcessId, true);
};

export const luoEiHyvaksymiskirjeetPDFHaulle = async ({
  hakuOid,
  templateName,
  lang,
}: {
  hakuOid: string;
  templateName: string;
  lang: Language;
}): Promise<FileResult> => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.jalkiohjauskirjeetUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('tag', hakuOid);
  urlWithQuery.searchParams.append('templateName', templateName);
  const body = {
    letterBodyText: '',
    hakemusOids: null,
    languageCode: lang.toUpperCase(),
  };
  const startProcessResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    body,
  );
  const kirjeetProcessId = startProcessResponse?.data?.id;
  return await downloadProcessDocument(kirjeetProcessId, true);
};

export const luoOsoitetarratHakukohteessaHyvaksytyille = async ({
  sijoitteluajoId,
  hakukohde,
}: {
  sijoitteluajoId: string;
  hakukohde: Hakukohde;
}): Promise<string> => {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startExportOsoitetarratSijoittelussaHyvaksytyilleUrl,
  );
  urlWithQuery.searchParams.append('sijoitteluajoId', sijoitteluajoId);
  urlWithQuery.searchParams.append('hakuOid', hakukohde.hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohde.oid);
  const startProcessResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    {
      hakemusOids: [],
      tag: hakukohde.oid,
    },
  );
  const processId = startProcessResponse?.data?.id;
  return await processDocumentAndReturnDocumentId(processId, true);
};

type TemplateResponse = {
  name: string;
  templateReplacements: Array<{ name: string; defaultValue: string }>;
};

export const getKirjepohjatHakukohteelle = async (
  kirjepohjanNimi: KirjepohjaNimi,
  hakukohde: Hakukohde,
): Promise<Array<Kirjepohja>> => {
  const configuration = getConfiguration();
  const opetuskieliCode = (getOpetuskieliCode(hakukohde) || 'fi').toUpperCase();
  const res = await client.get<Array<TemplateResponse>>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu.kirjepohjat,
      {
        templateName: kirjepohjanNimi,
        language: opetuskieliCode,
        tarjoajaOid: hakukohde.tarjoajaOid,
        tag: hakukohde.oid,
        hakuOid: hakukohde.hakuOid,
      },
    ),
  );
  return res.data.map((tr) => {
    const content = tr.templateReplacements.find(
      (r) => r.name === 'sisalto',
    )?.defaultValue;
    return { nimi: tr.name, sisalto: content || '' };
  });
};

export const documentIdForHakukohdeQueryOptions = ({
  hakukohdeOid,
  documentType,
}: {
  hakukohdeOid: string;
  documentType: DokumenttiTyyppi;
}) =>
  queryOptions({
    queryKey: ['getDocumentIdForHakukohde', hakukohdeOid, documentType],
    queryFn: () => getDocumentIdForHakukohde(hakukohdeOid, documentType),
  });

export const getDocumentIdForHakukohde = async (
  hakukohdeOid: string,
  documentType: DokumenttiTyyppi,
): Promise<string | null> => {
  const configuration = getConfiguration();
  const res = await client.get<[{ documentId: string }] | undefined>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu.dokumentitUrl,
      {
        tyyppi: documentType,
        hakukohdeOid,
      },
    ),
  );
  return res?.data && res.data?.length > 0 ? res.data[0]?.documentId : null;
};

export const getMyohastyneetHakemukset = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
}: KoutaOidParams & {
  hakemusOids: Array<string>;
}) => {
  // Ei kannata tehdä kyselyä ilman hakemusOideja, koska palauttaa silloin kuitenkin aina tyhjän.
  if (hakemusOids.length === 0) {
    return [];
  }
  const configuration = getConfiguration();
  const response = await client.post<
    Array<{ hakemusOid: string; mennyt: boolean; vastaanottoDeadline: string }>
  >(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .myohastyneetHakemuksetUrl,
      {
        hakuOid,
        hakukohdeOid,
      },
    ),
    hakemusOids,
  );

  return response?.data;
};

export const tuloskirjeidenMuodostuksenTilanne = async (
  hakuOid: string,
): Promise<Array<LetterCounts>> => {
  const configuration = getConfiguration();
  const res = await client.get<{
    [key: string]: {
      [key: string]: {
        letterBatchId: number | null;
        letterTotalCount: number;
        letterReadyCount: number;
        letterErrorCount: number;
        letterPublishedCount: number;
        readyForPublish: boolean;
        readyForEPosti: boolean;
        groupEmailId: number | null;
      };
    };
  }>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .tuloskirjeidenMuodostuksenTilanneUrl,
      { hakuOid },
    ),
  );
  const letterCounts: Array<LetterCounts> = [];
  for (const key of Object.keys(res.data)) {
    for (const lang of ['fi', 'sv', 'en']) {
      const countObject = res.data[key][lang];
      letterCounts.push({
        templateName: key,
        lang: lang as Language,
        ...countObject,
      });
    }
  }
  return letterCounts;
};

export async function publishLetters(
  hakuOid: string,
  templateName: string,
  lang: Language,
) {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu.julkaiseTuloskirjeetUrl,
      {
        hakuOid,
      },
    ),
  );
  urlWithQuery.searchParams.append('kirjeenTyyppi', templateName);
  urlWithQuery.searchParams.append('asiointikieli', lang);
  await client.post(urlWithQuery.toString(), {});
}

export async function sendLetters(
  hakuOid: string,
  templateName: string,
  lang: Language,
  letterId: number,
) {
  const configuration = getConfiguration();
  const reqBody = {
    hakuOid,
    letterId,
    asiointikieli: lang,
    kirjeenTyyppi: templateName,
  };
  await client.post(
    configuration.routes.valintalaskentakoostepalvelu.lahetaEPostiUrl,
    reqBody,
  );
}

export async function saveErillishakuValinnanTulokset({
  haku,
  hakukohdeOid,
  hakemukset,
  lastModified,
}: {
  haku: Haku;
  hakukohdeOid: string;
  hakemukset: Array<
    HakemuksenValinnanTulos & {
      poistetaankoRivi?: boolean;
    }
  >;
  lastModified?: string;
}) {
  const configuration = getConfiguration();
  const erillishakuHakemukset = hakemukset.map((hakemus) => ({
    hakemusOid: hakemus.hakemusOid,
    personOid: hakemus.hakijaOid,
    hakemuksenTila: hakemus.valinnanTila,
    vastaanottoTila: hakemus.vastaanottoTila,
    ilmoittautumisTila: hakemus.ilmoittautumisTila,
    julkaistaankoTiedot: Boolean(hakemus.julkaistavissa),
    ehdollisestiHyvaksyttavissa: hakemus.ehdollisestiHyvaksyttavissa,
    valinnantilanKuvauksenTekstiFI: hakemus.valinnanTilanKuvausFI,
    valinnantilanKuvauksenTekstiSV: hakemus.valinnanTilanKuvausSV,
    valinnantilanKuvauksenTekstiEN: hakemus.valinnanTilanKuvausEN,
    poistetaankoRivi: hakemus.poistetaankoRivi,
  }));

  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startImportErillishakuValinnanTulosUrl,
  );

  urlWithQuery.searchParams.set('hakuOid', haku.oid);
  urlWithQuery.searchParams.set('hakukohdeOid', hakukohdeOid);
  urlWithQuery.searchParams.set(
    'hakutyyppi',
    isKorkeakouluHaku(haku) ? 'KORKEAKOULU' : 'TOISEN_ASTEEN_OPPILAITOS',
  );

  const { data } = await client.post<{ id: string }>(
    urlWithQuery,
    { rivit: erillishakuHakemukset },
    {
      headers: {
        'If-Unmodified-Since': (lastModified
          ? new Date(lastModified)
          : new Date()
        ).toUTCString(),
      },
    },
  );

  const processId = data.id;
  await processDocumentAndReturnDocumentId(processId, true);
}

export async function getErillishakuValinnanTulosExcel({
  haku,
  hakukohdeOid,
  valintatapajonoOid,
}: {
  haku: Haku;
  hakukohdeOid: string;
  valintatapajonoOid?: string;
}) {
  const configuration = getConfiguration();
  const urlWithQuery = new URL(
    configuration.routes.valintalaskentakoostepalvelu.startExportErillishakuValinnanTulosExcelUrl,
  );
  urlWithQuery.searchParams.set('hakuOid', haku.oid);
  urlWithQuery.searchParams.set('hakukohdeOid', hakukohdeOid);
  if (valintatapajonoOid) {
    urlWithQuery.searchParams.set('valintatapajonoOid', valintatapajonoOid);
  }
  urlWithQuery.searchParams.set(
    'hakutyyppi',
    isKorkeakouluHaku(haku) ? 'KORKEAKOULU' : 'TOISEN_ASTEEN_OPPILAITOS',
  );

  const { data } = await client.post<{ id: string }>(urlWithQuery, '');

  const processId = data.id;
  return downloadProcessDocument(processId, true);
}

export const hakijoidenVastaanottotilatValintatapajonolle = async (
  hakuOid: string,
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemusOids: Array<string>,
): Promise<Array<HakijanVastaanottoTila>> => {
  const configuration = getConfiguration();
  const response = await client.post<
    Array<{
      valintatapajonoOid: string;
      hakemusOid: string;
      tilaHakijalle: string;
    }>
  >(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .hakijanTilatValintatapajonolleUrl,
      {
        hakuOid,
        hakukohdeOid,
        valintatapajonoOid,
      },
    ),
    hakemusOids,
  );
  return response.data.map((hvt) => ({
    valintatapaJonoOid: hvt.valintatapajonoOid,
    vastaanottotila: hvt.tilaHakijalle as VastaanottoTila,
    hakemusOid: hvt.hakemusOid,
  }));
};

export const getHakukohteidenSuodatustiedotQueryOptions = ({
  hakuOid,
}: {
  hakuOid: string;
}) =>
  queryOptions({
    queryKey: ['getHakukohteidenSuodatustiedot', hakuOid],
    queryFn: () => getHakukohteidenSuodatustiedot({ hakuOid }),
  });

export const getHakukohteidenSuodatustiedot = async ({
  hakuOid,
}: {
  hakuOid: string;
}): Promise<HakukohteidenSuodatustiedot> => {
  const configuration = getConfiguration();
  const response = await client.get<
    Record<
      string,
      {
        hasValintakoe: boolean;
        varasijatayttoPaattyy?: string | null;
        laskettu: boolean;
        sijoittelematta: boolean;
        julkaisematta: boolean;
      }
    >
  >(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu
        .hakukohteidenSuodatustiedotUrl,
      {
        hakuOid,
      },
    ),
  );
  return mapValues(response.data, (suodatustieto) => ({
    ...suodatustieto,
    varasijatayttoPaattyy: suodatustieto.varasijatayttoPaattyy
      ? new Date(suodatustieto.varasijatayttoPaattyy)
      : undefined,
  }));
};

export async function getHaunParametrit(hakuOid: string) {
  const configuration = getConfiguration();
  const response = await client.get<{ koetulostentallennus: boolean }>(
    getConfigUrl(
      configuration.routes.valintalaskentakoostepalvelu.haunParametrit,
      { hakuOid },
    ),
  );
  return { pistesyottoEnabled: response?.data?.koetulostentallennus };
}
