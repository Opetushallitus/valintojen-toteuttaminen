'use client';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getHakukohteenLasketutValinnanvaiheet } from '../lib/valintalaskenta-service';
import { getHakemukset } from '../lib/ataru';
import { TranslatedName } from '../lib/localization/localization-types';
import {
  JonoSija,
  LaskettuValinnanVaihe,
  LaskettuValintatapajono,
} from '../lib/types/laskenta-types';
import { indexBy, map, mapKeys, omit, pipe, prop, sortBy } from 'remeda';

export type JonoSijaInternal = Omit<
  JonoSija,
  'jarjestyskriteerit' | 'harkinnanvarainen' | 'prioriteetti'
> & {
  pisteet?: number;
  hakutoiveNumero?: number;
  tuloksenTila?: string;
  muutoksenSyy?: TranslatedName;
};

export type JonoSijaWithHakijaInfo = JonoSijaInternal & {
  hakijanNimi: string;
  hakemusOid: string;
  hakijaOid: string;
};

export type LaskettuJonoInternal = Omit<
  LaskettuValintatapajono,
  'jonosijat'
> & {
  jonosijat: Array<JonoSijaInternal>;
};

export type LaskettuJonoWithHakijaInfo = Omit<
  LaskettuValintatapajono,
  'jonosijat'
> & {
  jonosijat: Array<JonoSijaWithHakijaInfo>;
};

export type LasketutValinnanvaiheetInternal = Array<
  Omit<LaskettuValinnanVaihe, 'valintatapajonot'> & {
    valintatapajonot?: Array<LaskettuJonoInternal>;
  }
>;

export const selectValinnanvaiheet = <H>({
  lasketutValinnanvaiheet,
  selectHakemusFields,
}: {
  lasketutValinnanvaiheet?: Array<LaskettuValinnanVaihe>;
  selectHakemusFields?: (hakemusOid: string) => H;
}) => {
  return pipe(
    lasketutValinnanvaiheet ?? [],
    map((valinnanVaihe) => {
      return {
        ...valinnanVaihe,
        valintatapajonot: valinnanVaihe?.valintatapajonot?.map(
          (valintatapajono) => {
            return {
              ...valintatapajono,
              jonosijat: pipe(
                valintatapajono?.jonosijat,
                map((jonosija) => {
                  const jarjestyskriteeri = jonosija.jarjestyskriteerit?.[0];

                  return {
                    ...omit(jonosija, [
                      'jarjestyskriteerit',
                      'harkinnanvarainen',
                      'prioriteetti',
                    ]),
                    ...(selectHakemusFields?.(jonosija.hakemusOid) ?? {}),
                    hakutoiveNumero: jonosija.prioriteetti,
                    pisteet: jarjestyskriteeri?.arvo,
                    tuloksenTila: jonosija.tuloksenTila,
                    muutoksenSyy: mapKeys(
                      jarjestyskriteeri?.kuvaus ?? {},
                      (key) => key.toLowerCase(),
                    ),
                  };
                }),
              ),
            };
          },
        ),
      };
    }),
    sortBy([prop('jarjestysnumero'), 'desc']),
  );
};

export const useLasketutValinnanVaiheet = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const [{ data: hakemukset }, { data: lasketutValinnanvaiheet }] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: ['getHakemukset', hakuOid, hakukohdeOid],
          queryFn: () => getHakemukset({ hakuOid, hakukohdeOid }),
        },
        {
          queryKey: ['getLasketutValinnanVaiheet', hakukohdeOid],
          queryFn: () => getHakukohteenLasketutValinnanvaiheet(hakukohdeOid),
        },
      ],
    });

  const hakemuksetByOid = indexBy(hakemukset ?? [], prop('hakemusOid'));

  return selectValinnanvaiheet({
    lasketutValinnanvaiheet,
    selectHakemusFields(hakemusOid) {
      const hakemus = hakemuksetByOid[hakemusOid];
      return hakemus
        ? {
            hakijanNimi: hakemus.hakijanNimi,
            hakemusOid: hakemus.hakemusOid,
            hakijaOid: hakemus.hakijaOid,
            hakemuksenTila: hakemus.tila,
          }
        : {};
    },
  });
};
