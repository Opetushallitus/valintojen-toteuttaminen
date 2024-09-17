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
import { mapKeys, toLowerCase } from 'remeda';

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
  return valintakoeOsallistumiset?.reduce(
    (result, osallistumistulos) => {
      osallistumistulos.hakutoiveet.forEach((hakutoive) => {
        if (hakutoive.hakukohdeOid === hakukohdeOid) {
          hakutoive.valinnanVaiheet.forEach((valinnanVaihe) => {
            valinnanVaihe.valintakokeet.forEach((valintakoe) => {
              const { valintakoeTunniste, nimi } = valintakoe;
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
                : valintakoe.osallistuminenTulos.osallistuminen;
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
                    valintakoe?.osallistuminenTulos?.kuvaus ?? {},
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
