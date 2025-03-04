'use client';

import { useMemo } from 'react';
import useToaster from '@/hooks/useToaster';
import { useActorRef } from '@xstate/react';
import { Box } from '@mui/material';
import { SijoittelunTuloksetActions } from './sijoittelun-tulos-actions';
import { createSijoittelunTuloksetMachine } from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { useIsDirtySijoittelunTulos } from '../lib/sijoittelun-tulokset-state-utils';

type SijoittelunTuloksetFormParams = {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  lastModified: string;
  kaikkiJonotHyvaksytty: boolean;
};

export const SijoittelunTulosForm = ({
  valintatapajono,
  hakukohde,
  haku,
  sijoitteluajoId,
  lastModified,
  kaikkiJonotHyvaksytty,
}: SijoittelunTuloksetFormParams) => {
  const { addToast } = useToaster();

  const sijoittelunTulosMachine = useMemo(() => {
    return createSijoittelunTuloksetMachine(
      hakukohde.oid,
      valintatapajono.oid,
      valintatapajono.hakemukset,
      lastModified,
      addToast,
    );
  }, [hakukohde, valintatapajono, addToast, lastModified]);

  const sijoittelunTulosActorRef = useActorRef(sijoittelunTulosMachine);

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
      />
    </Box>
  );
};
