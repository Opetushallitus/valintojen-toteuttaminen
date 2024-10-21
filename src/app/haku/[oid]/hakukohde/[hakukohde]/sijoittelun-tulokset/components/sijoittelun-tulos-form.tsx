'use client';

import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { FormEvent, useMemo, useState } from 'react';
import useToaster from '@/app/hooks/useToaster';
import { useMachine } from '@xstate/react';
import { styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import useConfirmChangesBeforeNavigation from '@/app/hooks/useConfirmChangesBeforeNavigation';
import { SijoittelunTuloksetActions } from './sijoittelun-tulos-actions';
import {
  createSijoittelunTuloksetMachine,
  HakemuksetStateChangeEvent,
  SijoittelunTuloksetChangeEvent,
  SijoittelunTuloksetEvents,
  SijoittelunTuloksetStates,
} from '../lib/sijoittelun-tulokset-state';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { Haku } from '@/app/lib/types/kouta-types';
import { useSijoittelunTulosSearch } from '../hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { useTranslations } from '@/app/hooks/useTranslations';

type SijoittelunTuloksetFormParams = {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
  hakukohdeOid: string;
  lastModified: string;
};

const StyledForm = styled('form')(({ theme }) => ({
  border: `1px solid ${ophColors.grey100}`,
  padding: theme.spacing(2.5),
  width: '100%',
}));

export const SijoittelunTulosForm = ({
  valintatapajono,
  hakukohdeOid,
  haku,
  lastModified,
}: SijoittelunTuloksetFormParams) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const syottoMachine = useMemo(() => {
    return createSijoittelunTuloksetMachine(
      haku.oid,
      hakukohdeOid,
      valintatapajono.oid,
      valintatapajono.hakemukset,
      lastModified,
      addToast,
    );
  }, [haku, hakukohdeOid, valintatapajono, addToast, lastModified]);

  const [state, send] = useMachine(syottoMachine);

  const { results, pageResults, sort, setSort, pageSize, setPage, page } =
    useSijoittelunTulosSearch(valintatapajono.oid, valintatapajono.hakemukset);

  const [dirty, setDirty] = useState(false);

  useConfirmChangesBeforeNavigation(dirty);

  const submitChanges = (event: FormEvent) => {
    setDirty(false);
    send({ type: SijoittelunTuloksetEvents.UPDATE });
    event.preventDefault();
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
      <SijoittelunTuloksetActions state={state} />
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
          hakemukset={pageResults}
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
