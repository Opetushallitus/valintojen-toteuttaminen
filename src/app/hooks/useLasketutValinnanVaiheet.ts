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
import { indexBy, map, mapKeys, pipe, prop, sortBy } from 'remeda';

export type JonoSijaWithHakijaInfo = Omit<
  JonoSija,
  'jarjestyskriteerit' | 'harkinnanvarainen'
> & {
  hakijanNimi: string;
  hakemusOid: string;
  hakijaOid: string;
  pisteet?: number;
  hakutoiveNumero?: number;
  tuloksenTila?: string;
  muutoksenSyy?: TranslatedName;
};

export type LaskettuJonoWithHakijaInfo = LaskettuValintatapajono & {
  jonosijat: Array<JonoSijaWithHakijaInfo>;
};

export const selectValinnanvaiheet = <H1, H2>({
  lasketutValinnanVaiheet,
  hakemuksetByOid,
  selectHakemusFields,
}: {
  lasketutValinnanVaiheet: Array<LaskettuValinnanVaihe>;
  hakemuksetByOid: Record<string, H1>;
  selectHakemusFields: (hakemus: H1) => H2;
}) => {
  return pipe(
    lasketutValinnanVaiheet,
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
                  const hakemus = hakemuksetByOid[jonosija.hakemusOid];
                  const jarjestyskriteeri = jonosija.jarjestyskriteerit?.[0];

                  return {
                    ...jonosija,
                    ...selectHakemusFields(hakemus),
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
    sortBy(prop('jarjestysnumero')),
  );
};

export const useLasketutValinnanVaiheet = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const [{ data: hakemukset }, { data: lasketutValinnanVaiheet }] =
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
    hakemuksetByOid,
    lasketutValinnanVaiheet,
    selectHakemusFields(hakemus) {
      return {
        hakijanNimi: hakemus.hakijanNimi,
        hakemusOid: hakemus.hakemusOid,
        hakijaOid: hakemus.hakijaOid,
        hakemuksenTila: hakemus.tila,
      };
    },
  });
};
