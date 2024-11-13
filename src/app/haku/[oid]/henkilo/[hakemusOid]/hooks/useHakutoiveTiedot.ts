'use client';

import { getAtaruHakemukset, parseHakijaTiedot } from '@/app/lib/ataru';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { getPostitoimipaikka } from '@/app/lib/koodisto';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import { getHakemuksenLasketutValinnanvaiheet } from '@/app/lib/valintalaskenta-service';
import { selectValinnanvaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { getLatestSijoitteluajonTuloksetForHakemus } from '@/app/lib/valinta-tulos-service';
import { notFound } from 'next/navigation';

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

export const useHakutoiveTiedot = ({
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
      {
        queryKey: ['getHakemuksenLasketutValinnanvaiheet', hakuOid, hakemusOid],
        queryFn: () =>
          getHakemuksenLasketutValinnanvaiheet({ hakuOid, hakemusOid }),
      },
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

  const hakukohdeOids = hakemus.hakutoiveet.map(prop('hakukohdeOid'));

  const { data: userPermissions } = useUserPermissions();

  const [{ data: hakukohteet }, { data: postitoimipaikka }] =
    useSuspenseQueries({
      queries: [
        {
          ...getHakukohteetQueryOptions(hakuOid, userPermissions),
          select: (hakukohteet: Array<Hakukohde>) => {
            return pipe(
              hakukohteet,
              filter((h) => hakukohdeOids.includes(h.oid)),
              sortBy((h) => hakukohdeOids.indexOf(h.oid)),
              map((hakukohde) => {
                return {
                  ...hakukohde,
                  valinnanvaiheet: selectValinnanvaiheet({
                    lasketutValinnanvaiheet:
                      valinnanvaiheetByHakukohde?.[hakukohde.oid],
                  }),
                  sijoittelunTulokset:
                    sijoittelunTuloksetByHakukohde?.[hakukohde.oid],
                };
              }),
            );
          },
        },
        {
          queryKey: ['getPostitoimipaikka', hakemus.postinumero],
          queryFn: () => getPostitoimipaikka(hakemus.postinumero),
        },
      ],
    });

  return { hakukohteet, hakija, postitoimipaikka };
};
