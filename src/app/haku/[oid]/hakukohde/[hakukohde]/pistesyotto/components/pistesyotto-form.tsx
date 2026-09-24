import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import { PisteSyottoTable } from './pistesyotto-table';
import { usePisteSyottoSearchResults } from '../hooks/usePisteSyottoSearch';
import { useCallback, SubmitEvent } from 'react';
import useToaster, { Toast } from '@/hooks/useToaster';
import { PisteSyottoActions } from './pistesyotto-actions';
import { HakukohteenPistetiedot } from '@/lib/types/laskenta-types';
import { FormBox } from '@/components/form-box';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useQueryClient } from '@tanstack/react-query';
import { refetchPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';
import { usePistesyottoState } from '../lib/hakukohde-pistesyotto-state';
import { useNavigationBlockerWithWindowEvents } from '@/hooks/useNavigationBlocker';
import { useIsPistesyottoAllowedForHaku } from '@/hooks/usePistesyottoAllowedForHaku';

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

  const pistesyottoDisabled = !useIsPistesyottoAllowedForHaku(hakuOid);

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

  const submitChanges = (event: SubmitEvent<HTMLFormElement>) => {
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
        pisteSyottoDisabled={pistesyottoDisabled}
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
          pisteSyottoDisabled={pistesyottoDisabled}
          naytaVainLaskentaanVaikuttavat={naytaVainLaskentaanVaikuttavat}
        />
      </TablePaginationWrapper>
    </FormBox>
  );
};
