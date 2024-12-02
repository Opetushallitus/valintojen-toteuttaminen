import { configuration } from './configuration';
import { abortableClient, client, HttpClientResponse } from './http-client';
import { HenkilonValintaTulos } from './types/sijoittelu-types';
import {
  HakemuksenPistetiedot,
  HakukohteenPistetiedot,
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from './types/laskenta-types';
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
import { OphApiError, EMPTY_ARRAY, EMPTY_OBJECT } from './common';
import { getHakemukset, getHakijat } from './ataru';
import {
  getValintakokeet,
  getValintakoeAvaimetHakukohteelle,
  getValintakoeAvaimetHakukohteille,
} from './valintaperusteet';
import { ValintakoekutsutData } from './types/valintakoekutsut-types';
import { HakutoiveValintakoeOsallistumiset } from './types/valintalaskentakoostepalvelu-types';
import { HarkinnanvaraisuudenSyy } from './types/harkinnanvaraiset-types';
import { ValintakoeAvaimet } from './types/valintaperusteet-types';

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

  const hakemuksetKokeilla: HakemuksenPistetiedot[] =
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

const getContentFilename = (headers: Headers) => {
  const contentDisposition = headers.get('content-disposition');
  return contentDisposition?.match(/ filename="(.*)"$/)?.[1];
};

const createFileResult = async (response: HttpClientResponse<Blob>) => ({
  fileName: getContentFilename(response.headers),
  blob: response.data,
});

const downloadProcessDocument = async (processId: string) => {
  const processRes = await client.get<{
    dokumenttiId: string;
    kasittelyssa: boolean;
    keskeytetty: boolean;
    kokonaistyo: {
      valmis: boolean;
    };
    poikkeukset: Array<{
      viesti: string;
    }>;
  }>(configuration.dokumenttiProsessiUrl({ id: processId }));

  const { dokumenttiId, poikkeukset } = processRes.data;

  if (!isEmpty(poikkeukset)) {
    const errorMessages = poikkeukset.map(prop('viesti')).join('\n');
    throw Error(errorMessages);
  }

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

export const putPistesyottoExcel = async ({
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
