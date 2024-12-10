'use client';

import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '../hooks/usePisteSyottoSearch';
import { FormEvent, useState } from 'react';
import useToaster from '@/app/hooks/useToaster';
import {
  PisteSyottoEvent,
  usePistesyottoMachine,
} from '../lib/pistesyotto-state';
import { useActorRef, useSelector } from '@xstate/react';
import { PisteSyottoActions } from './pistesyotto-actions';
import {
  HakukohteenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/app/lib/types/laskenta-types';
import useConfirmChangesBeforeNavigation from '@/app/hooks/useConfirmChangesBeforeNavigation';
import { FormBox } from '@/app/components/form-box';

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

  const syottoMachine = usePistesyottoMachine({
    hakuOid,
    hakukohdeOid,
    pistetiedot: pistetulokset.hakemukset,
    addToast,
  });

  // TODO: dirty pistesyötto-masiinan sisään
  const [dirty, setDirty] = useState(false);

  const pistesyottoActorRef = useActorRef(syottoMachine);

  const state = useSelector(pistesyottoActorRef, (s) => s);

  useConfirmChangesBeforeNavigation(dirty);

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
    setDirty(false);
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
