'use client';

import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './table/pistesyotto-table';
import { usePisteSyottoSearchResults } from '@/app/hooks/usePisteSyottoSearch';
import { FormEvent, useMemo, useState } from 'react';
import useToaster from '@/app/hooks/useToaster';
import {
  createPisteSyottoMachine,
  PisteSyottoEvents,
  PisteSyottoStates,
} from './pistesyotto-state';
import { useMachine } from '@xstate/react';
import { PisteSyottoActions } from './pistesyotto-actions';
import { styled } from '@mui/material';
import { colors } from '@opetushallitus/oph-design-system';
import { HakukohteenPistetiedot } from '@/app/lib/types/laskenta-types';
import useConfirmChangesBeforeNavigation from '@/app/hooks/useConfirmChangesBeforeNavigation';

type PisteSyottoFormParams = {
  hakuOid: string;
  hakukohdeOid: string;
  pistetulokset: HakukohteenPistetiedot;
};

const StyledForm = styled('form')({
  border: `1px solid ${colors.grey100}`,
  padding: '1.2rem',
  width: '100%',
});

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

  const syottoMachine = useMemo(() => {
    return createPisteSyottoMachine(
      hakuOid,
      hakukohdeOid,
      pistetulokset.hakemukset,
      addToast,
    );
  }, [hakuOid, hakukohdeOid, pistetulokset, addToast]);

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
    send({ type: PisteSyottoEvents.UPDATE });
    event.preventDefault();
  };

  const updateForm = (changeParams: ChangePisteSyottoFormParams) => {
    send({
      type: PisteSyottoEvents.ADD_CHANGED_PISTETIETO,
      value: changeParams.value,
      hakemusOid: changeParams.hakemusOid,
      koeTunniste: changeParams.koeTunniste,
      updateArvo: changeParams.updateArvo,
    });
    setDirty(true);
  };

  return (
    <StyledForm
      autoComplete="off"
      onSubmit={submitChanges}
      data-test-id="pistesyotto-form"
    >
      <PisteSyottoActions state={state} />
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
    </StyledForm>
  );
};
