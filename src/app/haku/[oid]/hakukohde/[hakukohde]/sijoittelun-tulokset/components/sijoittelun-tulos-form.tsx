'use client';

import { useCallback } from 'react';
import useToaster from '@/hooks/useToaster';
import { Box } from '@mui/material';
import { SijoittelunTuloksetActions } from './sijoittelun-tulos-actions';
import { useSijoittelunTulosActorRef } from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { useIsDirtySijoittelunTulos } from '../lib/sijoittelun-tulokset-state-utils';
import { useQueryClient } from '@tanstack/react-query';
import { refetchSijoittelunTulokset } from '../lib/refetch-sijoittelun-tulokset';

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
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  const onUpdated = useCallback(() => {
    refetchSijoittelunTulokset(haku.oid, hakukohde.oid, queryClient);
  }, [haku.oid, hakukohde.oid, queryClient]);

  const sijoittelunTulosActorRef = useSijoittelunTulosActorRef({
    hakukohdeOid: hakukohde.oid,
    valintatapajonoOid: valintatapajono.oid,
    hakemukset: valintatapajono.hakemukset,
    lastModified,
    addToast,
    onUpdated: onUpdated,
  });

  const isDirty = useIsDirtySijoittelunTulos(sijoittelunTulosActorRef);

  useConfirmChangesBeforeNavigation(isDirty);

  return (
    <Box
      sx={{ width: '100%' }}
      data-test-id={`sijoittelun-tulokset-form-${valintatapajono.oid}`}
    >
      <SijoittelunTuloksetActions
        haku={haku}
        hakukohde={hakukohde}
        valintatapajonoOid={valintatapajono.oid}
        sijoittelunTulosActorRef={sijoittelunTulosActorRef}
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
