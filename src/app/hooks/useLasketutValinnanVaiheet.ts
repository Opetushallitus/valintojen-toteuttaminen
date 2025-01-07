'use client';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getHakukohteenLasketutValinnanvaiheet } from '../lib/valintalaskenta-service';
import { getHakemukset } from '../lib/ataru';
import { TranslatedName } from '../lib/localization/localization-types';
import {
  JonoSijaModel,
  LaskettuValinnanVaiheModel,
  LaskettuValintatapajonoModel,
} from '../lib/types/laskenta-types';
import { indexBy, map, mapKeys, omit, pipe, prop, sortBy } from 'remeda';
import { HakemuksenTila } from '@/app/lib/types/ataru-types';

export type JonoSija = Omit<
  JonoSijaModel,
  'harkinnanvarainen' | 'prioriteetti'
> & {
  pisteet?: number;
  hakutoiveNumero?: number;
  tuloksenTila?: string;
  muutoksenSyy?: TranslatedName;
};

type AdditionalHakemusFields = {
  hakijanNimi: string;
  hakemuksenTila: HakemuksenTila;
};

export type JonoSijaWithHakijaInfo = JonoSija & AdditionalHakemusFields;

export type LaskettuJono = Omit<LaskettuValintatapajonoModel, 'jonosijat'> & {
  jonosijat: Array<JonoSija>;
};

export type LaskettuJonoWithHakijaInfo = Omit<
  LaskettuValintatapajonoModel,
  'jonosijat'
> & {
  jonosijat: Array<JonoSijaWithHakijaInfo>;
};

export type LasketutValinnanvaiheet = Array<
  Omit<LaskettuValinnanVaiheModel, 'valintatapajonot'> & {
    valintatapajonot?: Array<LaskettuJono>;
  }
>;

export const selectLasketutValinnanvaiheet = <
  H extends Record<string, unknown> = Record<string, never>,
>({
  lasketutValinnanvaiheet,
  selectHakemusFields,
}: {
  lasketutValinnanvaiheet?: Array<LaskettuValinnanVaiheModel>;
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
                    ...omit(jonosija, ['harkinnanvarainen', 'prioriteetti']),
                    ...((selectHakemusFields?.(jonosija.hakemusOid) ??
                      {}) as H),
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

  return selectLasketutValinnanvaiheet<AdditionalHakemusFields>({
    lasketutValinnanvaiheet,
    selectHakemusFields(hakemusOid) {
      const hakemus = hakemuksetByOid[hakemusOid];
      return {
        hakijanNimi: hakemus.hakijanNimi,
        hakemuksenTila: hakemus.tila,
      };
    },
  });
};
