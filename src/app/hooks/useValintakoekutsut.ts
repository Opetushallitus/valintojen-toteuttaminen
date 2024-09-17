'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Language,
  TranslatedName,
} from '../lib/localization/localization-types';
import {
  getValintakoekutsutData,
  Osallistuminen,
  ValintakoekutsutData,
} from '../lib/valintalaskentakoostepalvelu';
import { useMemo } from 'react';
import { forEachObj, mapKeys, toLowerCase } from 'remeda';

export type ValintakoeKutsuItem = {
  hakemusOid: string;
  henkiloOid: string;
  hakijanNimi: string;
  asiointiKieli: Language;
  osallistuminen: Osallistuminen;
  lisatietoja: TranslatedName;
  laskettuPvm: string;
};

type GetValintakoekutsutParams = {
  hakuOid: string;
  hakukohdeOid: string;
  ryhmittely: Ryhmittely;
  vainKutsuttavat: boolean;
};

export type Ryhmittely = 'kokeittain' | 'hakijoittain';

export const createValintakoekutsutKokeittain = (
  {
    hakukohdeOid,
    vainKutsuttavat,
  }: Omit<GetValintakoekutsutParams, 'hakuOid' | 'ryhmittely'>,
  {
    valintakoeOsallistumiset,
    hakemuksetByOid,
    valintakokeetByTunniste,
  }: ValintakoekutsutData,
) => {
  const kutsutKokeittain = valintakoeOsallistumiset?.reduce(
    (result, osallistumistulos) => {
      osallistumistulos.hakutoiveet.forEach((hakutoive) => {
        if (hakutoive.hakukohdeOid === hakukohdeOid) {
          hakutoive.valinnanVaiheet.forEach((valinnanVaihe) => {
            valinnanVaihe.valintakokeet.forEach((valintakoeTulos) => {
              const { valintakoeTunniste, nimi } = valintakoeTulos;
              const valintakoe = valintakokeetByTunniste[valintakoeTunniste];
              if (!valintakokeetByTunniste[valintakoeTunniste]) {
                return result;
              }
              if (!result[valintakoeTunniste]) {
                result[valintakoeTunniste] = {
                  nimi,
                  kutsut: [],
                };
              }
              const hakemus = hakemuksetByOid[osallistumistulos.hakemusOid];

              const osallistuminen = valintakoe.kutsutaankoKaikki
                ? 'OSALLISTUU'
                : valintakoeTulos.osallistuminenTulos.osallistuminen;
              if (
                (vainKutsuttavat && osallistuminen === 'OSALLISTUU') ||
                !vainKutsuttavat
              ) {
                result[valintakoeTunniste].kutsut.push({
                  hakemusOid: hakemus.hakemusOid,
                  henkiloOid: hakemus?.hakijaOid,
                  hakijanNimi: hakemus?.hakijanNimi,
                  asiointiKieli: hakemus?.asiointikieliKoodi,
                  osallistuminen,
                  lisatietoja: mapKeys(
                    valintakoeTulos?.osallistuminenTulos?.kuvaus ?? {},
                    (k) => toLowerCase(k),
                  ),
                  laskettuPvm: osallistumistulos.createdAt,
                });
              }
            });
          });
        }
      });
      return result;
    },
    {} as Record<
      string,
      {
        nimi: string;
        kutsut: Array<ValintakoeKutsuItem>;
      }
    >,
  );

  // Lisätään myös valintakokeet, joille ei ollut kutsuja
  forEachObj(valintakokeetByTunniste, (valintakoe) => {
    if (!kutsutKokeittain[valintakoe.selvitettyTunniste]) {
      kutsutKokeittain[valintakoe.selvitettyTunniste] = {
        nimi: valintakoe.nimi,
        kutsut: [],
      };
    }
  });

  return kutsutKokeittain;
};

export const useValintakoekutsut = ({
  hakuOid,
  hakukohdeOid,
  ryhmittely,
  vainKutsuttavat,
}: GetValintakoekutsutParams) => {
  const { data: valintakoekutsutData } = useSuspenseQuery({
    queryKey: ['getValintakoekutsutData', hakukohdeOid],
    queryFn: () => getValintakoekutsutData({ hakuOid, hakukohdeOid }),
  });

  return useMemo(() => {
    if (ryhmittely === 'kokeittain') {
      return createValintakoekutsutKokeittain(
        { hakukohdeOid, vainKutsuttavat },
        valintakoekutsutData,
      );
    } else {
      // TODO: Toteuta ryhmittely hakijoittain
      return {};
    }
  }, [hakukohdeOid, vainKutsuttavat, ryhmittely, valintakoekutsutData]);
};
