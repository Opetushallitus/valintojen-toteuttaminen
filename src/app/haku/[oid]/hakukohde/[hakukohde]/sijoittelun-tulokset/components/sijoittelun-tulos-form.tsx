'use client';

import { useMemo } from 'react';
import useToaster from '@/app/hooks/useToaster';
import { useActorRef } from '@xstate/react';
import { Box } from '@mui/material';
import { SijoittelunTuloksetActions } from './sijoittelun-tulos-actions';
import {
  createSijoittelunTuloksetMachine,
  useIsDirtySijoittelunTulos,
} from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';

type SijoittelunTuloksetFormParams = {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  lastModified: string;
};

export const SijoittelunTulosForm = ({
  valintatapajono,
  hakukohde,
  haku,
  sijoitteluajoId,
  lastModified,
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
      />
    </Box>
  );
};
