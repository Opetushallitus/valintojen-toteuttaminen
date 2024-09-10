'use client';

import { TabContainer } from '../tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { ClientSpinner } from '@/app/components/client-spinner';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getScoresForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './table/pistesyotto-table';
import { usePisteSyottoSearchResults } from '@/app/hooks/usePisteSyottoSearch';
import { PisteSyottoControls } from './pistesyotto-controls';
import { useMemo } from 'react';
import useToaster from '@/app/hooks/useToaster';
import { createPisteSyottoMachine } from './pistesyotto-state';
import { useMachine } from '@xstate/react';
import { PisteSyottoActions } from './pistesyotto-actions';

type PisteSyottoContentParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const PisteSyottoContent = ({
  hakuOid,
  hakukohdeOid,
}: PisteSyottoContentParams) => {
  const { data: pistetulokset } = useSuspenseQuery({
    queryKey: ['getScoresForHakukohde', hakukohdeOid],
    queryFn: () => getScoresForHakukohde(hakuOid, hakukohdeOid),
  });

  const { addToast } = useToaster();

  const syottoMachine = useMemo(() => {
    return createPisteSyottoMachine(
      hakuOid,
      hakukohdeOid,
      pistetulokset.hakemukset,
      addToast,
    );
  }, [hakuOid, hakukohdeOid, pistetulokset, addToast]);

  const [state, send] = useMachine(syottoMachine);

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

  return (
    <>
      <PisteSyottoControls kokeet={pistetulokset.valintakokeet} />
      <PisteSyottoActions state={state} send={send} />
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
          send={send}
        />
      </TablePaginationWrapper>
    </>
  );
};

export default function PisteSyottoPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
        <PisteSyottoContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
