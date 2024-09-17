'use client';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getHakemukset } from '../lib/ataru';
import {
  Language,
  TranslatedName,
} from '../lib/localization/localization-types';
import { Hakemus } from '../lib/types/ataru-types';
import { getHakukohdeValintakokeet } from '../lib/valintaperusteet';
import {
  getValintakoeTulokset,
  Osallistuminen,
} from '../lib/valintalaskentakoostepalvelu';
import * as R from 'remeda';
import { toFormattedDateTimeString } from '../lib/localization/translation-utils';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hakemukset, valintakokeet, valintakoeTulokset] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHakemukset', hakuOid, hakukohdeOid],
        queryFn: () => getHakemukset(hakuOid, hakukohdeOid),
        staleTime: 120 * 1000,
        select: (data: Array<Hakemus>) =>
          data?.reduce(
            (result, hakemus) => {
              result[hakemus.hakemusOid] = hakemus;
              return result;
            },
            {} as Record<string, Hakemus>,
          ),
      },
      {
        queryKey: ['getHakukohdeValintakokeet', hakukohdeOid],
        queryFn: () => getHakukohdeValintakokeet(hakukohdeOid),
      },
      {
        queryKey: ['getValintakoetulokset', hakukohdeOid],
        queryFn: () => getValintakoeTulokset(hakukohdeOid),
      },
    ],
  });
  const hakemuksetByOid = hakemukset.data;

  return useMemo(() => {
    if (ryhmittely === 'kokeittain') {
      return valintakoeTulokset.data?.reduce(
        (result, valintakoeTulos) => {
          valintakoeTulos.hakutoiveet.forEach((hakutoive) => {
            if (hakutoive.hakukohdeOid === hakukohdeOid) {
              hakutoive.valinnanVaiheet.forEach((valinnanVaihe) => {
                valinnanVaihe.valintakokeet.forEach((valintakoe) => {
                  const { valintakoeTunniste, nimi } = valintakoe;
                  if (!result[valintakoeTunniste]) {
                    result[valintakoeTunniste] = {
                      nimi,
                      kutsut: [],
                    };
                  }
                  const hakemus = hakemuksetByOid[valintakoeTulos.hakemusOid];

                  const osallistuminen =
                    valintakoe.osallistuminenTulos.osallistuminen;
                  // TODO: Ehkä muita ehtoja milloin näytetään? Tarvitseeko oikeasti noutaa valintakokeet?
                  if (
                    (vainKutsuttavat && osallistuminen === 'OSALLISTUU') ||
                    !vainKutsuttavat
                  ) {
                    result[valintakoeTunniste].kutsut.push({
                      henkiloOid: hakemus?.hakijaOid,
                      hakemusOid: hakemus.hakemusOid,
                      hakijanNimi: hakemus?.hakijanNimi,
                      asiointiKieli: hakemus?.asiointikieliKoodi,
                      osallistuminen:
                        valintakoe.osallistuminenTulos.osallistuminen,
                      lisatietoja: R.mapKeys(
                        valintakoe?.osallistuminenTulos?.kuvaus ?? {},
                        (k) => R.toLowerCase(k),
                      ),
                      laskettuPvm: toFormattedDateTimeString(
                        valintakoeTulos.createdAt,
                      ),
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
    valintakoeTulokset.data,
    hakemuksetByOid,
    hakukohdeOid,
    vainKutsuttavat,
    ryhmittely,
  ]);
};
