import { configuration } from '../configuration';
import { abortableClient, client, createFileResult } from '../http-client';
import { HenkilonValintaTulos } from '../types/sijoittelu-types';
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
  HakutoiveValintakoeOsallistumiset,
  Kirjepohja,
  KirjepohjaNimi,
} from './valintalaskentakoostepalvelu-types';
import { HarkinnanvaraisuudenSyy } from '../types/harkinnanvaraiset-types';
import { ValintakoeAvaimet } from '../valintaperusteet/valintaperusteet-types';
import { Hakukohde } from '../kouta/kouta-types';
import { getOpetuskieliCode } from '../kouta/kouta-service';
import {
  INPUT_DATE_FORMAT,
  INPUT_TIME_FORMAT,
  toFormattedDateTimeString,
  translateName,
} from '../localization/translation-utils';
import { AssertionError } from 'assert';

export const getHakukohteenValintatuloksetIlmanHakijanTilaa = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<Array<HenkilonValintaTulos>> => {
  const { data } = await client.get<Array<{ tila: string; hakijaOid: string }>>(
    `${configuration.valintalaskentaKoostePalveluUrl}proxy/valintatulosservice/ilmanhakijantilaa/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  return data.map((t) => {
    return { tila: t.tila, hakijaOid: t.hakijaOid };
  });
};

export type ValintakokeidenOsallistumistiedot = Record<
  string,
  {
    osallistumistieto: ValintakoeOsallistuminenTulos;
  }
>;

type PistetietoItem = {
  applicationAdditionalDataDTO: {
    oid: string;
    additionalData: Record<string, string>;
  };
};

export type PisteetForHakemus = {
  lastmodified: string;
  hakukohteittain: Record<string, PistetietoItem>;
};

const getPisteetForHakemus = async ({ hakemusOid }: { hakemusOid: string }) => {
  const res = await client.get<PisteetForHakemus>(
    configuration.koostetutPistetiedotHakemukselleUrl({ hakemusOid }),
  );

  return res.data;
};

const selectKokeenPisteet = (
  pistetieto: PistetietoItem,
  kokeet: Array<ValintakoeAvaimet>,
): Array<ValintakokeenPisteet> => {
  return kokeet.map((k) => {
    const arvo =
      pistetieto.applicationAdditionalDataDTO.additionalData[k.tunniste];
    const osallistuminen = pistetieto.applicationAdditionalDataDTO
      .additionalData[
      k.osallistuminenTunniste
    ] as ValintakoeOsallistuminenTulos;
    return {
      tunniste: k.tunniste,
      arvo,
      osallistuminen,
      osallistuminenTunniste: k.osallistuminenTunniste,
    };
  });
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
    return selectKokeenPisteet(p, kokeet[hakukohdeOid]);
  });
};

export const getPisteetForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HakukohteenPistetiedot> => {
  const kokeetPromise = getValintakoeAvaimetHakukohteelle(hakukohdeOid);
  const hakemuksetPromise = getHakemukset({ hakuOid, hakukohdeOid });
  const pisteTiedotFetch = abortableClient.get<{
    lastmodified?: string;
    valintapisteet: Array<PistetietoItem>;
  }>(
    configuration.koostetutPistetiedotHakukohteelleUrl({
      hakuOid,
      hakukohdeOid,
    }),
  );

  const kokeet = await kokeetPromise;

  if (isEmpty(kokeet)) {
    pisteTiedotFetch.abort('Ei kokeita, perutaan pistetietojen haku');
    return { hakemukset: EMPTY_ARRAY, valintakokeet: EMPTY_ARRAY };
  }

  const [hakemukset, { data: pistetiedot }] = await Promise.all([
    hakemuksetPromise,
    pisteTiedotFetch.promise,
  ]);
  const hakemuksetIndexed = indexBy(hakemukset, prop('hakemusOid'));

  const hakemuksetKokeilla: Array<HakemuksenPistetiedot> =
    pistetiedot.valintapisteet.map((p: PistetietoItem) => {
      const hakemus = hakemuksetIndexed[p.applicationAdditionalDataDTO.oid];
      const kokeenPisteet: Array<ValintakokeenPisteet> = selectKokeenPisteet(
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
    configuration.koostetutPistetiedotHakukohteelleUrl({
      hakuOid,
      hakukohdeOid,
    }),
    mappedPistetiedot,
  );
};

const getValintakoeOsallistumiset = async ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) => {
  const response = await client.get<Array<HakutoiveValintakoeOsallistumiset>>(
    configuration.valintakoeOsallistumisetUrl({ hakukohdeOid }),
  );
  return response.data;
};

export async function getValintakoekutsutData({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}): Promise<ValintakoekutsutData> {
  const valintakokeet = await getValintakokeet(hakukohdeOid);

  if (isEmpty(valintakokeet)) {
    return {
      valintakokeet: EMPTY_ARRAY,
      hakemuksetByOid: EMPTY_OBJECT,
      valintakoeOsallistumiset: EMPTY_ARRAY,
    };
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

export type GetValintakoeExcelParams = {
  hakuOid: string;
  hakukohdeOid: string;
  hakemusOids?: Array<string>;
  valintakoeTunniste: Array<string>;
};

type ProcessResponse = {
  dokumenttiId: string;
  kasittelyssa: boolean;
  keskeytetty: boolean;
  kokonaistyo: {
    valmis: boolean;
  };
  poikkeukset: Array<{
    tunnisteet: Array<{
      oid: string;
      tunniste: string;
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
        p.tunnisteet.map((t) => ({ id: t.oid, message: t.tunniste })),
      );
    })
    .concat(warnings);
}

//TODO: poista tämä OK-800 yhteydessä ja käytä toista pollausfunktiota
const pollDocumentProcess = async (
  processId: string,
  infiniteWait: boolean,
) => {
  let pollTimes = 10;

  while (pollTimes || infiniteWait) {
    const processRes = await client.get<ProcessResponse>(
      configuration.dokumenttiProsessiUrl({ id: processId }),
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

const downloadProcessDocument = async (processId: string) => {
  const dokumenttiId = await processDocumentAndReturnDocumentId(processId);

  const documentRes = await client.get<Blob>(
    configuration.lataaDokumenttiUrl({ dokumenttiId }),
  );

  return createFileResult(documentRes);
};

export const downloadReadyProcessDocument = async (dokumenttiId: string) => {
  const documentRes = await client.get<Blob>(
    configuration.lataaDokumenttiUrl({ dokumenttiId }),
  );

  return createFileResult(documentRes);
};

export const getValintakoeExcel = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  valintakoeTunniste,
}: GetValintakoeExcelParams & { valintakoeTunniste: Array<string> }) => {
  const urlWithQuery = new URL(configuration.startExportValintakoeExcelUrl);
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);

  const createResponse = await client.post<{ id: string }>(urlWithQuery, {
    hakemusOids,
    valintakoeTunnisteet: valintakoeTunniste,
  });
  const excelProcessId = createResponse?.data?.id;
  return downloadProcessDocument(excelProcessId);
};

type GetValintakoeOsoitetarratParams = {
  hakuOid: string;
  hakukohdeOid: string;
  hakemusOids?: Array<string>;
  valintakoeTunniste: string;
};

export const getValintakoeOsoitetarrat = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  valintakoeTunniste,
}: GetValintakoeOsoitetarratParams) => {
  const urlWithQuery = new URL(
    configuration.startExportValintakoeOsoitetarratUrl,
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
  const startProcessResponse = await client.post<{ id: string }>(
    configuration.startExportOsoitetarratHakemuksilleUrl,
    {
      hakemusOids,
      tag,
    },
  );
  const tarratProcessId = startProcessResponse?.data?.id;
  return downloadProcessDocument(tarratProcessId);
};

export const getValintalaskennanTulosExcel = async ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) => {
  const excelRes = await client.get<Blob>(
    configuration.valintalaskennanTulosExcelUrl({ hakukohdeOid }),
  );
  return createFileResult(excelRes);
};

type ValintatapaJonoTulosExcelProps = {
  hakuOid: string;
  hakukohdeOid: string;
  valintatapajonoOid: string;
};

export const getValintatapajonoTulosExcel = async ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
}: ValintatapaJonoTulosExcelProps) => {
  const urlWithQuery = new URL(
    configuration.startExportValintatapajonoTulosExcelUrl,
  );
  urlWithQuery.searchParams.append('hakuOid', hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohdeOid);
  urlWithQuery.searchParams.append('valintatapajonoOid', valintatapajonoOid);

  const excelRes = await client.post<{ id: string }>(urlWithQuery, {});

  const excelProcessId = excelRes?.data?.id;

  return await downloadProcessDocument(excelProcessId);
};

const pollDocumentSeuranta = async (uuid: string) => {
  let pollTimes = 10;

  while (pollTimes) {
    const documentRes = await client.get<{
      uuid: string;
      kuvaus: string;
      valmis: boolean;
      virheilmoitukset: Array<{ tyyppi: string; ilmoitus: string }> | null;
      dokumenttiId: string | null;
      virheita: boolean;
    }>(configuration.dokumenttiSeurantaUrl({ uuid }));
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
  const urlWithQuery = new URL(
    configuration.startImportValintatapajonoTulosExcelUrl,
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
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const urlWithQuery = new URL(configuration.startExportPistesyottoExcelUrl);
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
}: {
  hakuOid: string;
  hakukohdeOid: string;
  sijoitteluajoId: string;
}) => {
  const urlWithQuery = new URL(configuration.sijoittelunTulosExcelUrl);
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

export const savePistesyottoExcel = async ({
  hakuOid,
  hakukohdeOid,
  excelFile,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  excelFile: File;
}) => {
  const urlWithQuery = new URL(configuration.startImportPistesyottoUrl);
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
  const res = await client.post<Array<HakemuksenHarkinnanvaraisuustiedot>>(
    configuration.harkinnanvaraisuudetHakemuksilleUrl,
    hakemusOids,
  );
  return res.data;
};

export const getUsesValintalaskenta = async ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) => {
  const res = await client.get<{ kayttaaValintalaskentaa: boolean }>(
    configuration.kayttaaValintalaskentaaUrl({ hakukohdeOid }),
  );
  return res.data.kayttaaValintalaskentaa;
};

function clearLetterBodySyntax(letterBody: string): string {
  return letterBody.replaceAll('&nbsp;', ' ');
}

export const luoHyvaksymiskirjeetPDF = async ({
  hakemusOids,
  sijoitteluajoId,
  hakukohde,
  letterBody,
  deadline,
  onlyForbidden,
}: {
  hakemusOids?: Array<string>;
  sijoitteluajoId: string;
  hakukohde: Hakukohde;
  letterBody: string;
  deadline?: Date | null;
  onlyForbidden: boolean;
}): Promise<string> => {
  const hakukohdeNimi = translateName(hakukohde.nimi);
  const opetuskieliCode = (getOpetuskieliCode(hakukohde) || 'fi').toUpperCase();
  const pvm = deadline
    ? toFormattedDateTimeString(deadline, INPUT_DATE_FORMAT)
    : null;
  const time = deadline
    ? toFormattedDateTimeString(deadline, INPUT_TIME_FORMAT)
    : null;
  const urlWithQuery = new URL(configuration.hyvaksymiskirjeetUrl);
  urlWithQuery.searchParams.append('hakuOid', hakukohde.hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohde.oid);
  urlWithQuery.searchParams.append('sijoitteluajoId', sijoitteluajoId);
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
    letterBodyText: clearLetterBodySyntax(letterBody),
    tag: hakukohde.oid,
  };
  const startProcessResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    body,
  );
  const kirjeetProcessId = startProcessResponse?.data?.id;
  return await processDocumentAndReturnDocumentId(kirjeetProcessId, true);
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
  const opetuskieliCode = (getOpetuskieliCode(hakukohde) || 'fi').toUpperCase();
  const urlWithQuery = new URL(configuration.eihyvaksymiskirjeetUrl);
  urlWithQuery.searchParams.append('hakuOid', hakukohde.hakuOid);
  urlWithQuery.searchParams.append('hakukohdeOid', hakukohde.oid);
  urlWithQuery.searchParams.append('sijoitteluajoId', sijoitteluajoId);
  urlWithQuery.searchParams.append('tarjoajaOid', hakukohde.tarjoajaOid);
  urlWithQuery.searchParams.append('lang', opetuskieliCode);
  urlWithQuery.searchParams.append('templateName', 'jalkiohjauskirje');
  const body = {
    hakemusOids: null,
    letterBodyText: clearLetterBodySyntax(letterBody),
    tag: hakukohde.oid,
  };
  const startProcessResponse = await client.post<{ id: string }>(
    urlWithQuery.toString(),
    body,
  );
  const kirjeetProcessId = startProcessResponse?.data?.id;
  return await processDocumentAndReturnDocumentId(kirjeetProcessId, true);
};

export const luoOsoitetarratHakukohteessaHyvaksytyille = async ({
  sijoitteluajoId,
  hakukohde,
}: {
  sijoitteluajoId: string;
  hakukohde: Hakukohde;
}): Promise<string> => {
  const urlWithQuery = new URL(
    configuration.startExportOsoitetarratSijoittelussaHyvaksytyilleUrl,
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
  const opetuskieliCode = (getOpetuskieliCode(hakukohde) || 'fi').toUpperCase();
  const res = await client.get<Array<TemplateResponse>>(
    configuration.kirjepohjat({
      templateName: kirjepohjanNimi,
      language: opetuskieliCode,
      tarjoajaOid: hakukohde.tarjoajaOid,
      tag: hakukohde.oid,
      hakuOid: hakukohde.hakuOid,
    }),
  );
  return res.data.map((tr) => {
    const content = tr.templateReplacements.find(
      (r) => r.name === 'sisalto',
    )?.defaultValue;
    return { nimi: tr.name, sisalto: content || '' };
  });
};

export const getDocumentIdForHakukohde = async (
  hakukohdeOid: string,
  documentType: DokumenttiTyyppi,
): Promise<string | null> => {
  const res = await client.get<[{ documentId: string }]>(
    configuration.dokumentitUrl({ tyyppi: documentType, hakukohdeOid }),
  );
  return res.data?.length > 0 ? res.data[0]?.documentId : null;
};

export const getMyohastyneetHakemukset = async ({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  hakemusOids: Array<string>;
}) => {
  // Ei kannata tehdä kyselyä ilman hakemusOideja, koska palauttaa silloin kuitenkin aina tyhjän.
  if (hakemusOids.length === 0) {
    return [];
  }

  const response = await client.post<
    Array<{ hakemusOid: string; mennyt: true; vastaanottoDeadline: string }>
  >(
    configuration.myohastyneetHakemuksetUrl({
      hakuOid,
      hakukohdeOid,
    }),
    hakemusOids,
  );

  return response?.data;
};
