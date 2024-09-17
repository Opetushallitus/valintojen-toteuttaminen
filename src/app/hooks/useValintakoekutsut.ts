'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Language,
  TranslatedName,
} from '../lib/localization/localization-types';
import {
  getValintakoeTulokset,
  Osallistuminen,
} from '../lib/valintalaskentakoostepalvelu';
import * as R from 'remeda';
import { useMemo } from 'react';

export type ValintakoeKutsuItem = {
  hakemusOid: string;
  henkiloOid: string;
  hakijanNimi: string;
  asiointiKieli: Language;
  osallistuminen: Osallistuminen;
  lisatietoja: TranslatedName;
  laskettuPvm: string;
};

export type Ryhmittely = 'kokeittain' | 'hakijoittain';

export const useValintakoekutsut = ({
  hakuOid,
  hakukohdeOid,
  ryhmittely,
  vainKutsuttavat,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  ryhmittely: Ryhmittely;
  vainKutsuttavat: boolean;
}) => {
  const valintakoeTuloksetData = useSuspenseQuery({
    queryKey: ['getValintakoetulokset', hakukohdeOid],
    queryFn: () => getValintakoeTulokset({ hakuOid, hakukohdeOid }),
  });

  const { valintakokeetByTunniste, valintakoeTulokset, hakemuksetByOid } =
    valintakoeTuloksetData.data;

  return useMemo(() => {
    if (ryhmittely === 'kokeittain') {
      return valintakoeTulokset?.reduce(
        (result, valintakoeTulos) => {
          valintakoeTulos.hakutoiveet.forEach((hakutoive) => {
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
                  const hakemus = hakemuksetByOid[valintakoeTulos.hakemusOid];

                  const osallistuminen = valintakoe.kutsutaankoKaikki
                    ? 'OSALLISTUU'
                    : valintakoe.osallistuminenTulos.osallistuminen;
                  if (
                    (vainKutsuttavat && osallistuminen === 'OSALLISTUU') ||
                    !vainKutsuttavat
                  ) {
                    result[valintakoeTunniste].kutsut.push({
                      henkiloOid: hakemus?.hakijaOid,
                      hakemusOid: hakemus.hakemusOid,
                      hakijanNimi: hakemus?.hakijanNimi,
                      asiointiKieli: hakemus?.asiointikieliKoodi,
                      osallistuminen,
                      lisatietoja: R.mapKeys(
                        valintakoe?.osallistuminenTulos?.kuvaus ?? {},
                        (k) => R.toLowerCase(k),
                      ),
                      laskettuPvm: valintakoeTulos.createdAt,
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
    } else {
      // TODO: Toteuta ryhmittely hakijoittain
      return {};
    }
  }, [
    valintakoeTulokset,
    hakemuksetByOid,
    hakukohdeOid,
    vainKutsuttavat,
    ryhmittely,
    valintakokeetByTunniste,
  ]);
};
