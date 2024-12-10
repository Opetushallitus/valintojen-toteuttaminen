'use client';

import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '../hooks/usePisteSyottoSearch';
import { FormEvent, useState } from 'react';
import useToaster from '@/app/hooks/useToaster';
import {
  PisteSyottoEvent,
  PisteSyottoStates,
  usePistesyottoMachine,
} from '../lib/pistesyotto-state';
import { useMachine } from '@xstate/react';
import { PisteSyottoActions } from './pistesyotto-actions';
import { HakukohteenPistetiedot } from '@/app/lib/types/laskenta-types';
import useConfirmChangesBeforeNavigation from '@/app/hooks/useConfirmChangesBeforeNavigation';
import { FormBox } from '@/app/components/form-box';

type PisteSyottoFormParams = {
  hakuOid: string;
  hakukohdeOid: string;
  pistetulokset: HakukohteenPistetiedot;
};

export type ChangePisteSyottoFormParams = {
  value: string;
  hakemusOid: string;
  koeTunniste: string;
  updateArvo: boolean;
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

  const [dirty, setDirty] = useState(false);
  const [state, send] = useMachine(syottoMachine);

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
    send({ type: PisteSyottoEvent.SAVE });
    event.preventDefault();
  };

  const updateForm = (changeParams: ChangePisteSyottoFormParams) => {
    send({
      type: PisteSyottoEvent.ADD_CHANGED_PISTETIETO,
      ...changeParams,
    });
    setDirty(true);
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
          updateForm={updateForm}
          disabled={!state.matches(PisteSyottoStates.IDLE)}
        />
      </TablePaginationWrapper>
    </FormBox>
  );
};
