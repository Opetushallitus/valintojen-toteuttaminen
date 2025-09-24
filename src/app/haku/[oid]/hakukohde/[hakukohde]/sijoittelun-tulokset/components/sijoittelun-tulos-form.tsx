'use client';

import { useCallback } from 'react';
import { Box } from '@mui/material';
import { ValinnanTuloksetActions } from '@/components/ValinnanTuloksetActions';
import { useSijoittelunTulosActorRef } from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useQueryClient } from '@tanstack/react-query';
import { useIsDirtyValinnanTulos } from '@/lib/state/valinnanTuloksetMachineUtils';
import { refetchLatestSijoitteluajonTuloksetWithValintaEsitys } from '@/lib/valinta-tulos-service/valinta-tulos-queries';
import { useNavigationBlockerWithWindowEvents } from '@/hooks/useNavigationBlocker';

type SijoittelunTuloksetFormParams = {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  lastModified: string;
  kaikkiJonotHyvaksytty: boolean;
  kayttaaLaskentaa: boolean;
};

export const SijoittelunTulosForm = ({
  valintatapajono,
  hakukohde,
  haku,
  sijoitteluajoId,
  lastModified,
  kaikkiJonotHyvaksytty,
  kayttaaLaskentaa,
}: SijoittelunTuloksetFormParams) => {
  const queryClient = useQueryClient();

  const onUpdated = useCallback(() => {
    refetchLatestSijoitteluajonTuloksetWithValintaEsitys(
      haku.oid,
      hakukohde.oid,
      queryClient,
    );
  }, [haku.oid, hakukohde.oid, queryClient]);

  const sijoittelunTulosActorRef = useSijoittelunTulosActorRef({
    hakukohdeOid: hakukohde.oid,
    valintatapajonoOid: valintatapajono.oid,
    hakemukset: valintatapajono.hakemukset,
    lastModified,
    onUpdated: onUpdated,
  });

  const isDirty = useIsDirtyValinnanTulos(sijoittelunTulosActorRef);

  useNavigationBlockerWithWindowEvents(isDirty);

  return (
    <Box
      sx={{ width: '100%' }}
      data-test-id={`sijoittelun-tulokset-form-${valintatapajono.oid}`}
    >
      <ValinnanTuloksetActions
        haku={haku}
        hakukohde={hakukohde}
        valinnanTulosActorRef={sijoittelunTulosActorRef}
        mode="sijoittelu"
      />
      <SijoittelunTulosTable
        haku={haku}
        hakukohde={hakukohde}
        valintatapajono={valintatapajono}
        sijoitteluajoId={sijoitteluajoId}
        sijoittelunTulosActorRef={sijoittelunTulosActorRef}
        kaikkiJonotHyvaksytty={kaikkiJonotHyvaksytty}
        kayttaaLaskentaa={kayttaaLaskentaa}
      />
    </Box>
  );
};
