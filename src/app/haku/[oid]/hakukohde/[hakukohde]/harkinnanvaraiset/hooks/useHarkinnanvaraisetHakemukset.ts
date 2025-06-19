'use client';

import { queryOptionsGetHakemukset } from '@/lib/ataru/ataru-queries';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { HakemuksenHarkinnanvaraisuus } from '@/lib/types/harkinnanvaraiset-types';
import { queryOptionsGetharkinnanvaraisetTilat } from '@/lib/valintalaskenta/valintalaskenta-queries';
import { getHarkinnanvaraisuudetHakemuksille } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { indexBy, prop } from 'remeda';

export const useHarkinnanvaraisetHakemukset = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams): Array<HakemuksenHarkinnanvaraisuus> => {
  const { data: hakemukset } = useSuspenseQuery(
    queryOptionsGetHakemukset({ hakuOid, hakukohdeOid }),
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
      queryOptionsGetharkinnanvaraisetTilat({ hakuOid, hakukohdeOid }),
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
