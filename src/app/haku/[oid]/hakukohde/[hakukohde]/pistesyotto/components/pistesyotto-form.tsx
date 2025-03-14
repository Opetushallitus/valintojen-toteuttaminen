'use client';

import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '../hooks/usePisteSyottoSearch';
import { FormEvent } from 'react';
import useToaster from '@/hooks/useToaster';
import { usePistesyottoState } from '@/lib/state/pistesyotto-state';
import { PisteSyottoActions } from './pistesyotto-actions';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { FormBox } from '@/components/form-box';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';

type PisteSyottoFormParams = {
  hakuOid: string;
  hakukohdeOid: string;
  pistetulokset: HakukohteenPistetiedot;
};

export const PisteSyottoForm = ({
  hakuOid,
  hakukohdeOid,
  pistetulokset,
}: PisteSyottoFormParams) => {
  const { addToast } = useToaster();

  const {
    actorRef: pistesyottoActorRef,
    isDirty,
    savePistetiedot,
    isUpdating,
  } = usePistesyottoState({
    hakuOid,
    hakukohdeOid,
    pistetiedot: pistetulokset.hakemukset,
    addToast,
  });

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
  } = usePisteSyottoSearchResults(pistetulokset);

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
        />
      </TablePaginationWrapper>
    </FormBox>
  );
};
