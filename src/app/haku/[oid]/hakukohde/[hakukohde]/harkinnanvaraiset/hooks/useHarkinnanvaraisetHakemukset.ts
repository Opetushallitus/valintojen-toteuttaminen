'use client';

import { getHakemuksetQueryOptions } from '@/lib/ataru/ataru-service';
import { HakemuksenHarkinnanvaraisuus } from '@/lib/types/harkinnanvaraiset-types';
import { getHarkinnanvaraisetTilat } from '@/lib/valintalaskenta/valintalaskenta-service';
import { getHarkinnanvaraisuudetHakemuksille } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import {
  queryOptions,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { indexBy, prop } from 'remeda';

type UsePisteTuloksetProps = {
  hakuOid: string;
  hakukohdeOid: string;
};

export const harkinnanvaraisetTilatOptions = ({
  hakuOid,
  hakukohdeOid,
}: UsePisteTuloksetProps) =>
  queryOptions({
    queryKey: ['getHarkinnanvaraisetTilat', hakuOid, hakukohdeOid],
    queryFn: () => getHarkinnanvaraisetTilat({ hakuOid, hakukohdeOid }),
  });

export const useHarkinnanvaraisetHakemukset = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}): Array<HakemuksenHarkinnanvaraisuus> => {
  const { data: hakemukset } = useSuspenseQuery(
    getHakemuksetQueryOptions({ hakuOid, hakukohdeOid }),
  );

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
      harkinnanvaraisetTilatOptions({ hakuOid, hakukohdeOid }),
    ],
  });

  return useMemo(() => {
    const result: Array<HakemuksenHarkinnanvaraisuus> = [];
    harkinnanvaraisuudetHakemuksille.forEach((h) => {
      const harkinnanvarainenTila =
        harkinnanvaraisestiHyvaksytyt.find(
          (tilaTieto) => tilaTieto.hakemusOid === h.hakemusOid,
        )?.harkinnanvaraisuusTila ?? null;
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
