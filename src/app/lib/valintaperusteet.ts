'use client';

import { configuration } from './configuration';
import { client } from './http-client';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
  ValintakoeAvaimet,
  Valintakoe,
  ValintakoeInputTyyppi,
  Valintaryhma,
  Valintatapajono,
} from './types/valintaperusteet-types';

export const isLaskentaUsedForValinnanvaihe = (
  valinnanvaihe: Valinnanvaihe,
): boolean => {
  return (
    valinnanvaihe.aktiivinen &&
    !valinnanvaihe.valisijoittelu &&
    (valinnanvaihe.jonot.length < 1 ||
      valinnanvaihe.jonot.some((jono) => {
        return (
          jono.kaytetaanValintalaskentaa &&
          (!jono.eiLasketaPaivamaaranJalkeen ||
            jono.eiLasketaPaivamaaranJalkeen.getTime() > new Date().getTime())
        );
      }))
  );
};

export const getValintaryhma = async (
  hakukohdeOid: string,
): Promise<Valintaryhma> => {
  const response = await client.get<Valintaryhma>(
    `${configuration.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valintaryhma`,
  );
  return { nimi: response.data.nimi, oid: response.data.oid };
};

export const getValinnanvaiheet = async (
  hakukohdeOid: string,
): Promise<Valinnanvaihe[]> => {
  const response = await client.get<
    Array<{
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
        },
      ];
    }>
  >(
    `${configuration.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valinnanvaihe?withValisijoitteluTieto=true`,
  );
  return response.data.map((vaihe) => {
    const tyyppi =
      vaihe.valinnanVaiheTyyppi == 'VALINTAKOE'
        ? ValinnanvaiheTyyppi.VALINTAKOE
        : ValinnanvaiheTyyppi.TAVALLINEN;
    const jonot: Valintatapajono[] = vaihe.jonot
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
  });
};

const determineValintaKoeInputTyyppi = (
  tunniste: string,
  funktioTyyppi: string,
  arvot: string[] | null,
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
): Promise<ValintakoeAvaimet[]> => {
  const { data } = await client.get<
    Array<{
      tunniste: string;
      arvot: string[] | null;
      kuvaus: string;
      max?: string | null;
      min?: string | null;
      osallistuminenTunniste: string;
      vaatiiOsallistumisen: boolean;
      funktiotyyppi: string;
    }>
  >(`${configuration.valintaperusteetUrl}hakukohde/avaimet/${hakukohdeOid}`);
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
  const response = await client.get<Array<Valintakoe>>(
    configuration.hakukohdeValintakokeetUrl({ hakukohdeOid }),
  );
  return response.data;
};
