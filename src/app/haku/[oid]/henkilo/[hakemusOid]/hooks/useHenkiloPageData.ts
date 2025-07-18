'use client';

import {
  getAtaruHakemukset,
  parseHakijaTiedot,
} from '@/lib/ataru/ataru-service';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { getPostitoimipaikka } from '@/lib/koodisto/koodisto-service';
import { getAllHakukohteet } from '@/lib/kouta/kouta-service';
import { useCheckPermission } from '@/hooks/useUserPermissions';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import { selectEditableValintalaskennanTulokset } from '@/hooks/useEditableValintalaskennanTulokset';
import { notFound } from 'next/navigation';
import { useMemo } from 'react';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { getKoePisteetForHakemus } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { getValintakoeAvaimetHakukohteille } from '@/lib/valintaperusteet/valintaperusteet-service';
import { queryOptionsGetHakemuksenValintalaskennanTulokset } from '@/lib/valintalaskenta/valintalaskenta-queries';
import {
  queryOptionsGetHakemuksenValinnanTulokset,
  queryOptionsGetLatestSijoitteluajonTuloksetForHakemus,
} from '@/lib/valinta-tulos-service/valinta-tulos-queries';

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
      queryOptionsGetHakemuksenValintalaskennanTulokset({
        hakuOid,
        hakemusOid,
      }),
      queryOptionsGetLatestSijoitteluajonTuloksetForHakemus({
        hakuOid,
        hakemusOid,
      }),
      queryOptionsGetHakemuksenValinnanTulokset({ hakemusOid }),
    ],
  });

  const valinnanTuloksetByHakukohde = valinnanTuloksetResponse.data;

  const hakija = parseHakijaTiedot(hakemus);

  const hakukohdeOids = useMemo(
    () => hakemus.hakutoiveet.map(prop('hakukohdeOid')),
    [hakemus.hakutoiveet],
  );

  const checkEditPermission = useCheckPermission('READ_UPDATE');

  const [
    { data: koutaHakukohteet },
    { data: postitoimipaikka },
    { data: pisteetByHakukohde, refetch: refetchPisteet },
    { data: kokeetByHakukohde },
  ] = useSuspenseQueries({
    queries: [
      {
        /**
         * Täytyy hakea tässä yhteydessä kaikki hakukohteet eikä normaalilla tavalla,
         * jossa haetaan vain käyttäjälle näkyvät hakukohteet.
         * Tämä siksi, että käyttäjällä voi olla lukuoikeus tiettyyn hakijan hakutoiveeseen,
         * mutta ei kaikkiin hakijan hakutoiveisiin ja myös hakijan muut hakutoiveet pitää näyttää. */
        queryKey: ['getAllHakukohteet', hakuOid],
        queryFn: () => getAllHakukohteet(hakuOid),
      },
      {
        queryKey: ['getPostitoimipaikka', hakemus.postinumero],
        queryFn: () => getPostitoimipaikka(hakemus.postinumero),
      },
      {
        queryKey: ['getPisteetForHakemus', hakemusOid, hakukohdeOids],
        queryFn: () => getKoePisteetForHakemus({ hakemusOid, hakukohdeOids }),
      },
      {
        queryKey: ['getValintakoeAvaimetHakukohteille', hakukohdeOids],
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
              valinnanTulos?.valintatapajonoOid,
          );

        const readOnly = !checkEditPermission(hakukohde.tarjoajaOid);

        return {
          ...hakukohde,
          readOnly,
          hakutoiveNumero: index + 1,
          valinnanvaiheet: selectEditableValintalaskennanTulokset({
            valintalaskennanTulokset:
              valinnanvaiheetByHakukohde?.[hakukohde.oid] ?? [],
            hakemukset: [{ hakemusOid, hakijaOid: hakija.hakijaOid }],
            // Henkilöittäin-näkymässä näytetään laskennattomat valinnanvaiheet vain, jos niille on tallennettu tuloksia
            valinnanvaiheet: [],
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
          pisteet: pisteetByHakukohde.pisteet[hakukohde.oid],
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
    pisteetByHakukohde.pisteet,
    hakemusOid,
    hakija.hakijaOid,
    checkEditPermission,
  ]);

  return {
    hakukohteet,
    hakija,
    postitoimipaikka,
    refetchPisteet,
    lastModified: pisteetByHakukohde.lastModified,
  };
};
