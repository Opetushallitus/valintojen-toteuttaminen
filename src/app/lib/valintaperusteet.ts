'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type Valintaryhma = {
  nimi: string;
  oid: string;
};

export enum ValinnanvaiheTyyppi {
  VALINTAKOE = 'valinnanvaihe.tyyppi.valintakoe',
  TAVALLINEN = 'valinnanvaihe.tyyppi.tavallinen',
}

export type Valintatapajono = {
  nimi: string;
  oid: string;
  eiLasketaPaivamaaranJalkeen?: Date;
  prioriteetti: number;
  kaytetaanValintalaskentaa: boolean;
};

export type Valinnanvaihe = {
  nimi: string;
  aktiivinen: boolean;
  valisijoittelu: boolean;
  tyyppi: ValinnanvaiheTyyppi;
  oid: string;
  jonot: Valintatapajono[];
};

export const isLaskentaUsedForValinnanvaihe = (
  valinnanvaihe: Valinnanvaihe,
): boolean => {
  return (
    valinnanvaihe.aktiivinen &&
    !valinnanvaihe.valisijoittelu &&
    valinnanvaihe.jonot.some((jono) => {
      return (
        jono.kaytetaanValintalaskentaa &&
        (!jono.eiLasketaPaivamaaranJalkeen ||
          jono.eiLasketaPaivamaaranJalkeen.getTime() > new Date().getTime())
      );
    })
  );
};

export const getValintaryhma = async (
  hakukohdeOid: string,
): Promise<Valintaryhma> => {
  const response = await client.get(
    `${configuration.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valintaryhma`,
  );
  return { nimi: response.data.nimi, oid: response.data.oid };
};

export const getValinnanvaiheet = async (
  hakukohdeOid: string,
): Promise<Valinnanvaihe[]> => {
  const response = await client.get(
    `${configuration.valintaperusteetUrl}hakukohde/${hakukohdeOid}/valinnanvaihe?withValisijoitteluTieto=true`,
  );
  return response.data.map(
    (vaihe: {
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
    }) => {
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
    },
  );
};
