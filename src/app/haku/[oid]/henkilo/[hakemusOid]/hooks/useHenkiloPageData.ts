'use client';

import { getAtaruHakemukset, parseHakijaTiedot } from '@/app/lib/ataru';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { getPostitoimipaikka } from '@/app/lib/koodisto';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import { hakemuksenLasketutValinnanvaiheetQueryOptions } from '@/app/lib/valintalaskenta-service';
import { selectValinnanvaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { getLatestSijoitteluajonTuloksetForHakemus } from '@/app/lib/valinta-tulos-service';
import { notFound } from 'next/navigation';
import { useMemo } from 'react';

const useAtaruHakemus = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['getAtaruHakemukset', hakuOid, hakemusOid],
    queryFn: () => getAtaruHakemukset({ hakuOid, hakemusOids: [hakemusOid] }),
  });
  return hakemukset;
};

export const useHenkiloPageData = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const hakemukset = useAtaruHakemus({ hakuOid, hakemusOid });

  const hakemus = hakemukset?.[0];

  if (!hakemus) {
    notFound();
  }

  const [
    { data: valinnanvaiheetByHakukohde },
    { data: sijoittelunTuloksetByHakukohde },
  ] = useSuspenseQueries({
    queries: [
      hakemuksenLasketutValinnanvaiheetQueryOptions({ hakuOid, hakemusOid }),
      {
        queryKey: [
          'getLatestSijoitteluajonTuloksetForHakemus',
          hakuOid,
          hakemusOid,
        ],
        queryFn: () =>
          getLatestSijoitteluajonTuloksetForHakemus({ hakuOid, hakemusOid }),
      },
    ],
  });

  const hakija = parseHakijaTiedot(hakemus);

  const hakukohdeOids = useMemo(
    () => hakemus.hakutoiveet.map(prop('hakukohdeOid')),
    [hakemus.hakutoiveet],
  );

  const { data: userPermissions } = useUserPermissions();

  const [{ data: hakukohteetPlain }, { data: postitoimipaikka }] =
    useSuspenseQueries({
      queries: [
        getHakukohteetQueryOptions(hakuOid, userPermissions),
        {
          queryKey: ['getPostitoimipaikka', hakemus.postinumero],
          queryFn: () => getPostitoimipaikka(hakemus.postinumero),
        },
      ],
    });

  const hakukohteet = useMemo(() => {
    return pipe(
      hakukohteetPlain,
      filter((h) => hakukohdeOids.includes(h.oid)),
      sortBy((h) => hakukohdeOids.indexOf(h.oid)),
      map((hakukohde) => {
        return {
          ...hakukohde,
          valinnanvaiheet: selectValinnanvaiheet({
            lasketutValinnanvaiheet:
              valinnanvaiheetByHakukohde?.[hakukohde.oid],
          }),
          sijoittelunTulokset: sijoittelunTuloksetByHakukohde?.[hakukohde.oid],
        };
      }),
    );
  }, [
    hakukohdeOids,
    hakukohteetPlain,
    valinnanvaiheetByHakukohde,
    sijoittelunTuloksetByHakukohde,
  ]);

  return { hakukohteet, hakija, postitoimipaikka };
};
