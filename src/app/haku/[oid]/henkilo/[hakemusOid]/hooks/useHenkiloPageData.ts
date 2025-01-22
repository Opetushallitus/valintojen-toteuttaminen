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
import { selectLasketutValinnanvaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import {
  getLatestSijoitteluajonTuloksetForHakemus,
  getValinnanTulokset,
} from '@/app/lib/valinta-tulos-service';
import { notFound } from 'next/navigation';
import { useMemo } from 'react';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { getKoePisteetForHakemus } from '@/app/lib/valintalaskentakoostepalvelu';
import { getValintakoeAvaimetHakukohteille } from '@/app/lib/valintaperusteet';

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

  const [
    { data: koutaHakukohteet },
    { data: postitoimipaikka },
    { data: pisteetByHakukohde },
    { data: kokeetByHakukohde },
  ] = useSuspenseQueries({
    queries: [
      getHakukohteetQueryOptions(hakuOid, userPermissions),
      {
        queryKey: ['getPostitoimipaikka', hakemus.postinumero],
        queryFn: () => getPostitoimipaikka(hakemus.postinumero),
      },
      {
        queryKey: ['getPisteetForHakemus', hakemusOid],
        queryFn: () => getKoePisteetForHakemus({ hakemusOid, hakukohdeOids }),
      },
      {
        queryKey: ['getValintakoeAvaimetHaukohteille', hakukohdeOids],
        queryFn: () => getValintakoeAvaimetHakukohteille({ hakukohdeOids }),
      },
    ],
  });

  const hakukohteet: Array<HenkilonHakukohdeTuloksilla> = useMemo(() => {
    return pipe(
      koutaHakukohteet,
      filter((h) => hakukohdeOids.includes(h.oid)),
      sortBy((h) => hakukohdeOids.indexOf(h.oid)),
      map((hakukohde, index) => {
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
          hakutoiveNumero: index + 1,
          valinnanvaiheet: selectLasketutValinnanvaiheet({
            lasketutValinnanvaiheet:
              valinnanvaiheetByHakukohde?.[hakukohde.oid] ?? [],
            hakemukset: [{ hakemusOid, hakijaOid: hakija.hakijaOid }],
            valinnanvaiheetIlmanLaskentaa: [], // TODO: Nouda valinnanvaiheet ilman laskentaa
          }),
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
          kokeet: kokeetByHakukohde[hakukohde.oid],
          pisteet: pisteetByHakukohde[hakukohde.oid],
        };
      }),
    );
  }, [
    hakukohdeOids,
    koutaHakukohteet,
    valinnanvaiheetByHakukohde,
    sijoittelunTuloksetByHakukohde,
    valinnanTuloksetByHakukohde,
    valinnanTuloksetResponse.lastModified,
    kokeetByHakukohde,
    pisteetByHakukohde,
    hakemusOid,
    hakija.hakijaOid,
  ]);

  return { hakukohteet, hakija, postitoimipaikka };
};
