'use client';

import { useCallback } from 'react';
import { Box } from '@mui/material';
import { ValinnanTulosActions } from '@/components/valinnan-tulos-actions';
import { useSijoittelunTulosActorRef } from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { useQueryClient } from '@tanstack/react-query';
import { refetchSijoittelunTulokset } from '../lib/refetch-sijoittelun-tulokset';
import { useIsDirtyValinnanTulos } from '@/lib/state/valinnan-tulos-machine-utils';

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
    refetchSijoittelunTulokset(haku.oid, hakukohde.oid, queryClient);
  }, [haku.oid, hakukohde.oid, queryClient]);

  const sijoittelunTulosActorRef = useSijoittelunTulosActorRef({
    hakukohdeOid: hakukohde.oid,
    valintatapajonoOid: valintatapajono.oid,
    hakemukset: valintatapajono.hakemukset,
    lastModified,
    onUpdated: onUpdated,
  });

  const isDirty = useIsDirtyValinnanTulos(sijoittelunTulosActorRef);

  useConfirmChangesBeforeNavigation(isDirty);

  return (
    <Box
      sx={{ width: '100%' }}
      data-test-id={`sijoittelun-tulokset-form-${valintatapajono.oid}`}
    >
      <ValinnanTulosActions
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
