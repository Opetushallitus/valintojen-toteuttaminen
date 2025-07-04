'use client';

import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '../hooks/usePisteSyottoSearch';
import { FormEvent, useCallback } from 'react';
import useToaster from '@/hooks/useToaster';
import { usePistesyottoState } from '@/lib/state/pistesyotto-state';
import { PisteSyottoActions } from './pistesyotto-actions';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { FormBox } from '@/components/form-box';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useHaunParametrit } from '@/lib/valintalaskentakoostepalvelu/useHaunParametrit';
import { GenericEvent } from '@/lib/common';
import { useQueryClient } from '@tanstack/react-query';
import { refetchPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';
import { isNonNullish } from 'remeda';

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
    (event: GenericEvent) => {
      if (event.type === 'success') {
        refetchPisteetForHakukohde(queryClient, { hakuOid, hakukohdeOid });
      }
      addToast({
        key: event.key,
        message: event.message,
        type: event.type,
        messageParams: event.messageParams,
        manualCloseOnly: isNonNullish(event.messageParams),
      });
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

  useConfirmChangesBeforeNavigation(isDirty);

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
