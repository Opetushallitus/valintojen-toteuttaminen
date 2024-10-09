'use client';

import { getHakemukset } from '@/app/lib/ataru';
import { Hakemus } from '@/app/lib/types/ataru-types';
import {
  getHarkinnanvaraisetTilat,
  HarkinnanvaraisuusTila,
} from '@/app/lib/valintalaskenta-service';
import {
  getHarkinnanvaraisuudetHakemuksille,
  HarkinnanvaraisuudenSyy,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { indexBy, prop } from 'remeda';

export type HakemuksenHarkinnanvaraisuus = Hakemus & {
  harkinnanvaraisuudenSyy?: `harkinnanvaraisuuden-syy.${HarkinnanvaraisuudenSyy}`;
  harkinnanvarainenTila?: HarkinnanvaraisuusTila;
};

export const useHarkinnanvaraisetHakemukset = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}): Array<HakemuksenHarkinnanvaraisuus> => {
  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['getHakemukset', hakukohdeOid],
    queryFn: () => getHakemukset({ hakuOid, hakukohdeOid }),
  });

  const hakemusOids = hakemukset.map((h) => h.hakemusOid);

  const hakemuksetByOid = useMemo(
    () => indexBy(hakemukset, prop('hakemusOid')),
    [hakemukset],
  );

  const [
    { data: harkinnanvaraisuudetHakemuksille },
    { data: harkinnanvaraisestiHyvaksytyt },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHarkinnanvaraisuudetHakemuksille', hakemusOids],
        queryFn: () => getHarkinnanvaraisuudetHakemuksille({ hakemusOids }),
      },
      {
        queryKey: ['getHarkinnanvaraisetTilat', hakuOid, hakukohdeOid],
        queryFn: () => getHarkinnanvaraisetTilat({ hakuOid, hakukohdeOid }),
      },
    ],
  });

  return useMemo(() => {
    const result: Array<HakemuksenHarkinnanvaraisuus> = [];
    harkinnanvaraisuudetHakemuksille.forEach((h) => {
      const harkinnanvarainenTila = harkinnanvaraisestiHyvaksytyt.find(
        (tilaTieto) => tilaTieto.hakemusOid === h.hakemusOid,
      )?.harkinnanvaraisuusTila;
      const harkinnanvaraisuudenSyy = h.hakutoiveet.find(
        (toive) => toive.hakukohdeOid === hakukohdeOid,
      )?.harkinnanvaraisuudenSyy;
      if (harkinnanvaraisuudenSyy !== 'EI_HARKINNANVARAINEN') {
        result.push({
          ...hakemuksetByOid[h.hakemusOid],
          harkinnanvaraisuudenSyy: harkinnanvaraisuudenSyy
            ? `harkinnanvaraisuuden-syy.${harkinnanvaraisuudenSyy}`
            : undefined,
          harkinnanvarainenTila,
        });
      }
    });
    return result;
  }, [
    harkinnanvaraisuudetHakemuksille,
    hakemuksetByOid,
    hakukohdeOid,
    harkinnanvaraisestiHyvaksytyt,
  ]);
};
