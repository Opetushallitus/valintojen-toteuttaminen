'use client';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getLasketutValinnanVaiheet } from '../lib/valintalaskenta-service';
import { Hakemus, getHakemukset } from '../lib/ataru';

export const useLasketutValinnanVaiheet = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const [hakemukset, lasketutValinnanVaiheet] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHakemukset', hakuOid, hakukohdeOid],
        queryFn: () => getHakemukset(hakuOid, hakukohdeOid),
      },
      {
        queryKey: ['getLasketutValinnanVaiheet', hakukohdeOid],
        queryFn: () => getLasketutValinnanVaiheet(hakukohdeOid),
      },
    ],
  });

  const hakemuksetByOid = hakemukset?.data?.reduce(
    (result, hakemus) => {
      result[hakemus.oid] = hakemus;
      return result;
    },
    {} as Record<string, Hakemus>,
  );

  return lasketutValinnanVaiheet.data?.map((valinnanVaihe) => {
    return {
      ...valinnanVaihe,
      valintatapajonot: valinnanVaihe?.valintatapajonot?.map(
        (valintatapajono) => {
          return {
            ...valintatapajono,
            jonosijat: valintatapajono?.jonosijat?.map((jonosija) => {
              const hakemus = hakemuksetByOid[jonosija.hakemusOid];
              const jarjestyskriteeri = jonosija.jarjestyskriteerit?.[0];

              return {
                ...jonosija,
                hakijanNimi: hakemus.hakijanNimi,
                hakutoiveNumero: jonosija.prioriteetti,
                hakemuksenTila: hakemus.hakemuksenTila,
                hakemusOid: hakemus.oid,
                henkiloOid: hakemus.henkiloOid,
                pisteet: jarjestyskriteeri?.arvo,
                tuloksenTila: jonosija.tuloksenTila,
                muutoksenSyy: Object.fromEntries(
                  Object.entries(jarjestyskriteeri?.kuvaus ?? {}).map(
                    ([key, value]) => [key.toLowerCase(), value],
                  ),
                ),
              };
            }),
          };
        },
      ),
    };
  });
};
