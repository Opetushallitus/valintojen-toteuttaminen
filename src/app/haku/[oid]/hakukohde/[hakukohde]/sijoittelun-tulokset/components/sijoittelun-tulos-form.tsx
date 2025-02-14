'use client';

import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import useToaster from '@/app/hooks/useToaster';
import { useMachine } from '@xstate/react';
import { styled } from '@mui/material';
import { SijoittelunTuloksetActions } from './sijoittelun-tulos-actions';
import {
  createSijoittelunTuloksetMachine,
  HakemuksetStateChangeEvent,
  SijoittelunTuloksetChangeEvent,
  SijoittelunTuloksetEvents,
  SijoittelunTuloksetStates,
} from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import { useSijoittelunTulosSearch } from '../hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';
import { useQueryClient } from '@tanstack/react-query';
import { tryToGetLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions } from '@/app/lib/valinta-tulos-service';

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

  const queryClient = useQueryClient();

  const onUpdateSuccess = useCallback(() => {
    const options =
      tryToGetLatestSijoitteluajonTuloksetWithValintaEsitysQueryOptions({
        hakuOid: haku.oid,
        hakukohdeOid: hakukohde.oid,
      });
    queryClient.resetQueries(options);
    queryClient.invalidateQueries(options);
  }, [queryClient, haku.oid, hakukohde.oid]);

  const syottoMachine = useMemo(() => {
    return createSijoittelunTuloksetMachine(
      hakukohde.oid,
      valintatapajono.oid,
      valintatapajono.hakemukset,
      lastModified,
      addToast,
      onUpdateSuccess,
    );
  }, [hakukohde, valintatapajono, addToast, lastModified, onUpdateSuccess]);

  const [state, send] = useMachine(syottoMachine);

  const { results, pageResults, sort, setSort, pageSize, setPage, page } =
    useSijoittelunTulosSearch(valintatapajono.oid, valintatapajono.hakemukset);

  const [dirty, setDirty] = useState(false);

  useConfirmChangesBeforeNavigation(dirty);

  const submitChanges = (event: FormEvent) => {
    send({ type: SijoittelunTuloksetEvents.UPDATE });
    event.preventDefault();
    setDirty(false);
  };

  const publish = () => {
    send({ type: SijoittelunTuloksetEvents.PUBLISH });
    setDirty(false);
  };

  const updateForm = (changeParams: SijoittelunTuloksetChangeEvent) => {
    send({
      type: SijoittelunTuloksetEvents.ADD_CHANGED_HAKEMUS,
      ...changeParams,
    });
    setDirty(true);
  };

  const massStatusChangeForm = (changeParams: HakemuksetStateChangeEvent) => {
    send({
      type: SijoittelunTuloksetEvents.CHANGE_HAKEMUKSET_STATES,
      ...changeParams,
    });
    setDirty(true);
  };

  return (
    <StyledForm
      autoComplete="off"
      onSubmit={submitChanges}
      data-test-id={`sijoittelun-tulokset-form-${valintatapajono.oid}`}
    >
      <SijoittelunTuloksetActions
        haku={haku}
        state={state}
        publish={publish}
        valintatapajono={valintatapajono}
        hakukohde={hakukohde}
        massUpdateForm={(changeParams: HakemuksetStateChangeEvent) => {
          send({
            type: SijoittelunTuloksetEvents.CHANGE_HAKEMUKSET_STATES,
            ...changeParams,
          });
          setDirty(true);
          send({ type: SijoittelunTuloksetEvents.UPDATE });
        }}
      />
      <TablePaginationWrapper
        label={`${t('yleinen.sivutus')} ${valintatapajono.nimi}`}
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageNumber={setPage}
        pageNumber={page}
        countHidden={true}
      >
        <SijoittelunTulosTable
          haku={haku}
          hakukohde={hakukohde}
          hakemukset={pageResults}
          sijoitteluajoId={sijoitteluajoId}
          sort={sort}
          setSort={setSort}
          updateForm={updateForm}
          massStatusChangeForm={massStatusChangeForm}
          disabled={!state.matches(SijoittelunTuloksetStates.IDLE)}
        />
      </TablePaginationWrapper>
    </StyledForm>
  );
};
