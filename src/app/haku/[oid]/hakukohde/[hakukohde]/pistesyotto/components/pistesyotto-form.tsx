'use client';

import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '../hooks/usePisteSyottoSearch';
import { FormEvent, useCallback } from 'react';
import useToaster, { Toast } from '@/hooks/useToaster';
import { PisteSyottoActions } from './pistesyotto-actions';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { FormBox } from '@/components/form-box';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useHaunParametrit } from '@/lib/valintalaskentakoostepalvelu/useHaunParametrit';
import { useQueryClient } from '@tanstack/react-query';
import { refetchPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';
import { usePistesyottoState } from '../lib/hakukohde-pistesyotto-state';
import { useNavigationBlockerWithWindowEvents } from '@/hooks/useNavigationBlocker';

export const PisteSyottoForm = ({
  hakuOid,
  hakukohdeOid,
  pistetiedot,
}: KoutaOidParams & {
  pistetiedot: HakukohteenPistetiedot;
}) => {
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  const onEvent = useCallback(
    (event: Toast) => {
      if (event.type === 'success') {
        refetchPisteetForHakukohde(queryClient, { hakuOid, hakukohdeOid });
      }
      addToast(event);
    },
    [addToast, queryClient, hakuOid, hakukohdeOid],
  );

  const {
    actorRef: pistesyottoActorRef,
    isDirty,
    savePistetiedot,
    isUpdating,
  } = usePistesyottoState({
    hakuOid,
    hakukohdeOid,
    pistetiedot: pistetiedot.hakemustenPistetiedot,
    valintakokeet: pistetiedot.valintakokeet,
    onEvent,
    lastModified: pistetiedot.lastModified,
  });

  const { data: haunParametrit } = useHaunParametrit({ hakuOid });

  useNavigationBlockerWithWindowEvents(isDirty);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    pageResults,
    sort,
    setSort,
    koeResults,
    naytaVainLaskentaanVaikuttavat,
  } = usePisteSyottoSearchResults(pistetiedot);

  const submitChanges = (event: FormEvent) => {
    savePistetiedot();
    event.preventDefault();
  };

  return (
    <FormBox
      autoComplete="off"
      onSubmit={submitChanges}
      data-test-id="pistesyotto-form"
    >
      <PisteSyottoActions
        isUpdating={isUpdating}
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        pisteSyottoDisabled={!haunParametrit.pistesyottoEnabled}
      />
      <TablePaginationWrapper
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPageNumber={setPage}
        pageNumber={page}
        countTranslationKey="hakeneet.hakija-maara"
      >
        <PisteSyottoTable
          key={`pistesyotto-table-${pistesyottoActorRef.getSnapshot().machine.id}`}
          setSort={setSort}
          sort={sort}
          pistetiedot={pageResults}
          kokeet={koeResults}
          pistesyottoActorRef={pistesyottoActorRef}
          pisteSyottoDisabled={!haunParametrit.pistesyottoEnabled}
          naytaVainLaskentaanVaikuttavat={naytaVainLaskentaanVaikuttavat}
        />
      </TablePaginationWrapper>
    </FormBox>
  );
};
