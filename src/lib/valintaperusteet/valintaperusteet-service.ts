'use client';

import { queryOptions } from '@tanstack/react-query';
import { client } from '../http-client';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
  ValintakoeAvaimet,
  Valintakoe,
  ValintakoeInputTyyppi,
  Valintaryhma,
  Valintatapajono,
  ValintaryhmaHakukohteilla,
} from './valintaperusteet-types';
import { sort } from 'remeda';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from '../configuration/configuration-utils';
import { booleanToString } from '../common';

export const getValintaryhma = async (
  hakukohdeOid: string,
): Promise<Valintaryhma> => {
  const configuration = getConfiguration();
  const response = await client.get<Valintaryhma>(
    `${configuration.routes.valintaperusteetService.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valintaryhma`,
  );
  return { nimi: response.data.nimi, oid: response.data.oid };
};

type ValinnanvaiheModel = {
  oid: string;
  nimi: string;
  aktiivinen: boolean;
  hasValisijoittelu: boolean;
  valinnanVaiheTyyppi: string;
  jonot: [
    {
      nimi: string;
      oid: string;
      aktiivinen: boolean;
      valisijoittelu: boolean;
      eiLasketaPaivamaaranJalkeen: string;
      prioriteetti: number;
      kaytetaanValintalaskentaa: boolean;
      automaattinenSijoitteluunSiirto: boolean;
    },
  ];
};

const convertValinnanvaihe = (vaihe: ValinnanvaiheModel): Valinnanvaihe => {
  const tyyppi =
    vaihe.valinnanVaiheTyyppi == 'VALINTAKOE'
      ? ValinnanvaiheTyyppi.VALINTAKOE
      : ValinnanvaiheTyyppi.TAVALLINEN;
  const jonot: Array<Valintatapajono> = vaihe.jonot
    .filter((jono) => jono.aktiivinen)
    .map((jono) => {
      const eiLasketaPaivamaaranJalkeen = jono.eiLasketaPaivamaaranJalkeen
        ? new Date(jono.eiLasketaPaivamaaranJalkeen)
        : undefined;
      return {
        oid: jono.oid,
        nimi: jono.nimi,
        prioriteetti: jono.prioriteetti,
        eiLasketaPaivamaaranJalkeen,
        kaytetaanValintalaskentaa: jono.kaytetaanValintalaskentaa,
        automaattinenSijoitteluunSiirto: jono.automaattinenSijoitteluunSiirto,
      };
    })
    .sort((j1, j2) => j1.prioriteetti - j2.prioriteetti);
  return {
    nimi: vaihe.nimi,
    aktiivinen: vaihe.aktiivinen,
    valisijoittelu: vaihe.hasValisijoittelu,
    tyyppi,
    oid: vaihe.oid,
    jonot,
  };
};

export const hakukohteenValinnanvaiheetQueryOptions = (
  hakukohdeOid: string,
) => {
  return queryOptions({
    queryKey: ['getValinnanvaiheet', hakukohdeOid],
    queryFn: () => getValinnanvaiheet(hakukohdeOid),
  });
};

export const getValinnanvaiheet = async (
  hakukohdeOid: string,
): Promise<Array<Valinnanvaihe>> => {
  const configuration = getConfiguration();
  const response = await client.get<Array<ValinnanvaiheModel>>(
    `${configuration.routes.valintaperusteetService.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valinnanvaihe?withValisijoitteluTieto=true`,
  );
  return response.data.map(convertValinnanvaihe);
};

const determineValintaKoeInputTyyppi = (
  tunniste: string,
  funktioTyyppi: string,
  arvot: Array<string> | null,
): ValintakoeInputTyyppi => {
  if (
    funktioTyyppi === 'TOTUUSARVOFUNKTIO' ||
    (arvot &&
      arvot.length === 2 &&
      arvot.indexOf('true') != -1 &&
      arvot.indexOf('false') != -1)
  ) {
    if (tunniste.includes('kielikoe')) {
      return ValintakoeInputTyyppi.BOOLEAN_ACCEPTED;
    }
    return ValintakoeInputTyyppi.BOOLEAN;
  }
  if (arvot && arvot.length > 0) {
    return ValintakoeInputTyyppi.SELECT;
  }
  return ValintakoeInputTyyppi.INPUT;
};

export const getValintakoeAvaimetHakukohteelle = async (
  hakukohdeOid: string,
): Promise<Array<ValintakoeAvaimet>> => {
  const configuration = getConfiguration();
  const { data } = await client.get<
    Array<{
      tunniste: string;
      arvot: Array<string> | null;
      kuvaus: string;
      max?: string | null;
      min?: string | null;
      osallistuminenTunniste: string;
      vaatiiOsallistumisen: boolean;
      funktiotyyppi: string;
    }>
  >(
    `${configuration.routes.valintaperusteetService.valintaperusteetUrl}hakukohde/avaimet/${hakukohdeOid}`,
  );
  return data.map((koe) => {
    const inputTyyppi = determineValintaKoeInputTyyppi(
      koe.tunniste,
      koe.funktiotyyppi,
      koe.arvot,
    );
    return {
      tunniste: koe.tunniste,
      osallistuminenTunniste: koe.osallistuminenTunniste,
      kuvaus: koe.kuvaus,
      arvot: koe.arvot ?? undefined,
      max: koe.max ?? undefined,
      min: koe.min ?? undefined,
      vaatiiOsallistumisen: koe.vaatiiOsallistumisen,
      inputTyyppi,
    };
  });
};

export const getValintakoeAvaimetHakukohteille = async ({
  hakukohdeOids,
}: {
  hakukohdeOids: Array<string>;
}) => {
  const avaimet = await Promise.all(
    hakukohdeOids.map((hakukohdeOid) =>
      getValintakoeAvaimetHakukohteelle(hakukohdeOid),
    ),
  );

  return Object.fromEntries(
    hakukohdeOids.map((hakukohdeOid, index) => {
      return [hakukohdeOid, avaimet[index]];
    }),
  );
};

export const getValintakokeet = async (hakukohdeOid: string) => {
  const configuration = getConfiguration();
  const response = await client.get<Array<Valintakoe>>(
    getConfigUrl(
      configuration.routes.valintaperusteetService.hakukohdeValintakokeetUrl,
      {
        hakukohdeOid,
      },
    ),
  );
  return response.data;
};

type ValintaryhmaHakukohteillaResponse = {
  hakuOid: string | null;
  oid: string;
  nimi: string;
  hakukohdeViitteet: Array<{ oid: string }>;
  alavalintaryhmat: Array<ValintaryhmaHakukohteillaResponse>;
};

function sortRyhmatByName(
  ryhmat: Array<ValintaryhmaHakukohteilla>,
): Array<ValintaryhmaHakukohteilla> {
  return sort(ryhmat, (a, b) => a.nimi.localeCompare(b.nimi, 'fi'));
}

function mapValintaryhma(
  ryhma: ValintaryhmaHakukohteillaResponse,
  parentOid: string | null = null,
): ValintaryhmaHakukohteilla {
  const sortedAlaryhmat = sortRyhmatByName(
    ryhma.alavalintaryhmat.map((avr) => mapValintaryhma(avr, ryhma.oid)),
  );
  return {
    oid: ryhma.oid,
    nimi: ryhma.nimi,
    parentOid,
    hakukohteet: ryhma.hakukohdeViitteet.map((h) => h.oid),
    alaValintaryhmat: sortedAlaryhmat,
  };
}

export const getValintaryhmat = async (
  hakuOid: string,
): Promise<{
  muutRyhmat: Array<ValintaryhmaHakukohteilla>;
  hakuRyhma: ValintaryhmaHakukohteilla | null;
}> => {
  const configuration = getConfiguration();
  const response = await client.get<Array<ValintaryhmaHakukohteillaResponse>>(
    `${configuration.routes.valintaperusteetService.valintaryhmatHakukohteilla}?hakuOid=${hakuOid}&hakukohteet=true`,
  );
  const hakuRyhma = response.data.find((r) => r.hakuOid === hakuOid);
  const muutRyhmat =
    hakuRyhma?.alavalintaryhmat.map((vr) => mapValintaryhma(vr)) ?? [];
  return {
    hakuRyhma: hakuRyhma ? mapValintaryhma(hakuRyhma) : null,
    muutRyhmat: sortRyhmatByName(muutRyhmat),
  };
};

export const onkoHaullaValintaryhma = async (
  hakuOid: string,
): Promise<boolean> => {
  const configuration = getConfiguration();
  return (
    await client.get<boolean>(
      getConfigUrl(
        configuration.routes.valintaperusteetService.onkoHaullaValintaryhma,
        {
          hakuOid,
        },
      ),
    )
  ).data;
};

export async function teeAutomaattinenSiirtoValintatapajonolle(
  valintatapajonoOid: string,
  status: boolean,
) {
  const configuration = getConfiguration();
  const { data: updatedJono } = await client.post<{ prioriteetti: number }>(
    // Miksi samat parametrit välitetään sekä URL:ssä että bodyssa?
    getConfigUrl(
      configuration.routes.valintaperusteetService.automaattinenSiirtoUrl,
      {
        valintatapajonoOid,
        status,
      },
    ),
    {
      valintatapajonoOid,
      status: booleanToString(status),
    },
    {
      cache: 'no-cache',
    },
  );
  return updatedJono;
}
