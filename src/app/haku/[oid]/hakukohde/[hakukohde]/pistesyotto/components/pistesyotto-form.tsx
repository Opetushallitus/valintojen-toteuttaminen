'use client';

import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '../hooks/usePisteSyottoSearch';
import { FormEvent } from 'react';
import useToaster from '@/app/hooks/useToaster';
import {
  PisteSyottoEvent,
  useIsDirty,
  usePistesyottoActorRef,
} from '../lib/pistesyotto-state';
import { useSelector } from '@xstate/react';
import { PisteSyottoActions } from './pistesyotto-actions';
import {
  HakukohteenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/app/lib/types/laskenta-types';
import { FormBox } from '@/app/components/form-box';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';

type PisteSyottoFormParams = {
  hakuOid: string;
  hakukohdeOid: string;
  pistetulokset: HakukohteenPistetiedot;
};

export type ChangePisteSyottoFormParams = {
  arvo?: string;
  osallistuminen?: ValintakoeOsallistuminenTulos;
  hakemusOid: string;
  koeTunniste: string;
};

export const PisteSyottoForm = ({
  hakuOid,
  hakukohdeOid,
  pistetulokset,
}: PisteSyottoFormParams) => {
  const { addToast } = useToaster();

  const pistesyottoActorRef = usePistesyottoActorRef({
    hakuOid,
    hakukohdeOid,
    pistetiedot: pistetulokset.hakemukset,
    addToast,
  });

  const isDirty = useIsDirty(pistesyottoActorRef);
  const state = useSelector(pistesyottoActorRef, (s) => s);

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
    pistesyottoActorRef.send({ type: PisteSyottoEvent.SAVE });
    event.preventDefault();
  };

  return (
    <FormBox
      autoComplete="off"
      onSubmit={submitChanges}
      data-test-id="pistesyotto-form"
    >
      <PisteSyottoActions
        state={state}
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
      />
      <TablePaginationWrapper
        totalCount={results?.length ?? 0}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPageNumber={setPage}
        pageNumber={page}
        countTranslationKey="hakeneet.maara"
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
