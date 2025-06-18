'use client';

import { getHakemuksetQueryOptions } from '@/lib/ataru/ataru-service';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
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

export const harkinnanvaraisetTilatOptions = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) =>
  queryOptions({
    queryKey: ['getHarkinnanvaraisetTilat', hakuOid, hakukohdeOid],
    queryFn: () => getHarkinnanvaraisetTilat({ hakuOid, hakukohdeOid }),
  });

export const useHarkinnanvaraisetHakemukset = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams): Array<HakemuksenHarkinnanvaraisuus> => {
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
        const hakemus = hakemuksetByOid[h.hakemusOid];
        if (hakemus) {
          result.push({
            ...hakemus,
            harkinnanvaraisuudenSyy: harkinnanvaraisuudenSyy
              ? `harkinnanvaraisuuden-syy.${harkinnanvaraisuudenSyy}`
              : undefined,
            harkinnanvarainenTila,
          });
        } else {
          console.warn(
            `Hakemus-OIDille ${h.hakemusOid} löytyi harkinnanvaraisuustieto, mutta ei hakemusta Atarusta!`,
          );
        }
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
