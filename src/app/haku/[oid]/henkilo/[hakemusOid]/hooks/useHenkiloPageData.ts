'use client';

import { getAtaruHakemukset, parseHakijaTiedot } from '@/app/lib/ataru';
import {
  queryOptions,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getPostitoimipaikka } from '@/app/lib/koodisto';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import { hakemuksenLasketutValinnanvaiheetQueryOptions } from '@/app/lib/valintalaskenta-service';
import {
  LasketutValinnanvaiheet,
  selectValinnanvaiheet,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import {
  getLatestSijoitteluajonTuloksetForHakemus,
  getValinnanTulokset,
  ValinnanTulosModel,
} from '@/app/lib/valinta-tulos-service';
import { notFound } from 'next/navigation';
import { useMemo } from 'react';
import { Hakukohde } from '@/app/lib/types/kouta-types';

export type ValinnanTulosLisatiedoilla = ValinnanTulosModel & {
  lastModified: Date | null;
  varasijanNumero?: number;
  hyvaksyttyHarkinnanvaraisesti: boolean;
};

type Tulokset = {
  valinnanvaiheet?: LasketutValinnanvaiheet;
  valinnanTulos?: ValinnanTulosLisatiedoilla;
};

export type HakukohdeTuloksilla = Hakukohde & Tulokset;

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

  const hakemus = hakemukset?.[0];

  if (!hakemus) {
    notFound();
  }

  return hakemus;
};

export const latestSijoitteluajonTuloksetForHakemusQueryOptions = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) =>
  queryOptions({
    queryKey: [
      'getLatestSijoitteluajonTuloksetForHakemus',
      hakuOid,
      hakemusOid,
    ],
    queryFn: () =>
      getLatestSijoitteluajonTuloksetForHakemus({ hakuOid, hakemusOid }),
  });

export const valinnanTuloksetQueryOptions = ({
  hakemusOid,
}: {
  hakemusOid: string;
}) =>
  queryOptions({
    queryKey: ['getValinnanTulokset', hakemusOid],
    queryFn: () => getValinnanTulokset({ hakemusOid }),
  });

export const useHenkiloPageData = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const hakemus = useAtaruHakemus({ hakuOid, hakemusOid });

  const [
    { data: valinnanvaiheetByHakukohde },
    { data: sijoittelunTuloksetByHakukohde },
    { data: valinnanTuloksetResponse },
  ] = useSuspenseQueries({
    queries: [
      hakemuksenLasketutValinnanvaiheetQueryOptions({ hakuOid, hakemusOid }),
      latestSijoitteluajonTuloksetForHakemusQueryOptions({
        hakuOid,
        hakemusOid,
      }),
      valinnanTuloksetQueryOptions({ hakemusOid }),
    ],
  });

  const valinnanTuloksetByHakukohde = valinnanTuloksetResponse.data;

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

  const hakukohteet: Array<HakukohdeTuloksilla> = useMemo(() => {
    return pipe(
      hakukohteetPlain,
      filter((h) => hakukohdeOids.includes(h.oid)),
      sortBy((h) => hakukohdeOids.indexOf(h.oid)),
      map((hakukohde) => {
        const valinnanTulos = valinnanTuloksetByHakukohde?.[hakukohde.oid];

        const sijoittelunTulos =
          sijoittelunTuloksetByHakukohde?.[hakukohde.oid];

        const sijoittelunJono =
          sijoittelunTulos?.hakutoiveenValintatapajonot?.find(
            (sijoitteluJono) =>
              sijoitteluJono.valintatapajonoOid ===
              valinnanTulos.valintatapajonoOid,
          );

        return {
          ...hakukohde,
          valinnanvaiheet: selectValinnanvaiheet({
            lasketutValinnanvaiheet:
              valinnanvaiheetByHakukohde?.[hakukohde.oid],
          }),
          sijoittelunTulokset: sijoittelunTuloksetByHakukohde?.[hakukohde.oid],
          valinnanTulos: valinnanTulos
            ? {
                ...valinnanTulos,
                lastModified: valinnanTuloksetResponse.lastModified,
                varasijanNumero: sijoittelunJono?.varasijanNumero,
                hyvaksyttyHarkinnanvaraisesti: Boolean(
                  sijoittelunJono?.hyvaksyttyHarkinnanvaraisesti,
                ),
              }
            : undefined,
        };
      }),
    );
  }, [
    hakukohdeOids,
    hakukohteetPlain,
    valinnanvaiheetByHakukohde,
    sijoittelunTuloksetByHakukohde,
    valinnanTuloksetByHakukohde,
    valinnanTuloksetResponse.lastModified,
  ]);

  return { hakukohteet, hakija, postitoimipaikka };
};
