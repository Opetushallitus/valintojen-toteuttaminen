'use client';

import { FormEvent, useMemo } from 'react';
import useToaster from '@/app/hooks/useToaster';
import { useMachine, useSelector } from '@xstate/react';
import { styled } from '@mui/material';
import { SijoittelunTuloksetActions } from './sijoittelun-tulos-actions';
import {
  createSijoittelunTuloksetMachine,
  SijoittelunTuloksetEventTypes,
  useIsDirtySijoittelunTulos,
} from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import { useSijoittelunTulosSearch } from '../hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';

type SijoittelunTuloksetFormParams = {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  lastModified: string;
};

const StyledForm = styled('form')({
  width: '100%',
});

export const SijoittelunTulosForm = ({
  valintatapajono,
  hakukohde,
  haku,
  sijoitteluajoId,
  lastModified,
}: SijoittelunTuloksetFormParams) => {
  const { t } = useTranslations();

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

  const [, send, sijoittelunTulosActorRef] = useMachine(
    sijoittelunTulosMachine,
  );

  const hakemukset = useSelector(
    sijoittelunTulosActorRef,
    (state) => state.context.hakemukset,
  );

  const { results, sort, setSort, pageSize, setPage, page } =
    useSijoittelunTulosSearch(valintatapajono.oid, hakemukset);

  const isDirty = useIsDirtySijoittelunTulos(sijoittelunTulosActorRef);

  useConfirmChangesBeforeNavigation(isDirty);

  const submitChanges = (event: FormEvent) => {
    send({ type: SijoittelunTuloksetEventTypes.UPDATE });
    event.preventDefault();
  };

  return (
    <StyledForm
      autoComplete="off"
      onSubmit={submitChanges}
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
        hakemukset={results}
        sijoitteluajoId={sijoitteluajoId}
        sort={sort}
        setSort={setSort}
        pagination={{
          page,
          setPage,
          pageSize,
          label: `${t('yleinen.sivutus')} ${valintatapajono.nimi}`,
        }}
        sijoittelunTulosActorRef={sijoittelunTulosActorRef}
      />
    </StyledForm>
  );
};
