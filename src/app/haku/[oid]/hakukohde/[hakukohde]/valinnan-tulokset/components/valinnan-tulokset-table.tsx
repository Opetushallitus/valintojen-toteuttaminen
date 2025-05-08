'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { useCallback, useMemo } from 'react';
import { KeysMatching, ListTableColumn } from '@/components/table/table-types';
import { useSelection } from '@/hooks/useSelection';
import { IlmoittautumisTilaSelect } from '@/components/ilmoittautumistila-select';
import { VastaanOttoCell } from '@/components/vastaanotto-cell';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { useValinnanTuloksetSearch } from '../hooks/useValinnanTuloksetSearch';
import { useSelector } from '@xstate/react';
import {
  ValinnanTulosActorRef,
  ValinnanTulosChangeParams,
  ValinnanTulosEventType,
  ValinnanTulosState,
} from '@/lib/state/valinnan-tulos-machine';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { ValinnanTilaCell } from '@/components/valinnan-tila-cell';
import { ValinnanTulosActionBar } from './valinnan-tulos-action-bar';
import { OtherActionsCell } from './other-actions-cell';

export const makeEmptyCountColumn = <T extends Record<string, unknown>>({
  title,
  key,
  amountProp,
}: {
  title: string;
  key: string;
  amountProp: KeysMatching<T, number | undefined>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{props[amountProp] as number}</span>,
  style: { width: 0, paddingRight: '1rem' },
});

const TRANSLATIONS_PREFIX = 'valinnan-tulokset.taulukko';

const useColumns = ({
  haku,
  hakukohde,
  actorRef,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  actorRef: ValinnanTulosActorRef;
}) => {
  const { t } = useTranslations();

  const state = useSelector(actorRef, (s) => s);
  const { send } = actorRef;

  const disabled = !state.matches(ValinnanTulosState.IDLE);

  const updateForm = useCallback(
    (changeParams: ValinnanTulosChangeParams) => {
      send({
        type: ValinnanTulosEventType.CHANGE,
        ...changeParams,
      });
    },
    [send],
  );

  return useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn(t);
    return [
      stickyHakijaColumn,
      makeColumnWithCustomRender<HakemuksenValinnanTulos>({
        title: t(`${TRANSLATIONS_PREFIX}.valinnan-tila`),
        key: 'valinnantila',
        renderFn: (hakemus) => (
          <ValinnanTilaCell
            haku={haku}
            hakemus={hakemus}
            disabled={disabled}
            updateForm={updateForm}
            isValinnanTilaEditable={true}
          />
        ),
      }),
      makeColumnWithCustomRender<HakemuksenValinnanTulos>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanoton-tila`),
        key: 'vastaanottotila',
        renderFn: (hakemus) => (
          <VastaanOttoCell
            haku={haku}
            hakukohde={hakukohde}
            hakemus={hakemus}
            updateForm={updateForm}
            disabled={disabled}
          />
        ),
      }),
      makeColumnWithCustomRender<HakemuksenValinnanTulos>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumisen-tila`),
        key: 'ilmoittautumisTila',
        renderFn: (hakemus) => {
          return (
            <IlmoittautumisTilaSelect
              hakemus={hakemus}
              updateForm={updateForm}
              disabled={disabled}
            />
          );
        },
      }),
      makeColumnWithCustomRender<HakemuksenValinnanTulos>({
        title: t(`${TRANSLATIONS_PREFIX}.toiminnot`),
        key: 'toiminnot',
        renderFn: (hakemus) => (
          <OtherActionsCell hakemus={hakemus} disabled={disabled} />
        ),
        sortable: false,
      }),
    ];
  }, [t, haku, hakukohde, updateForm, disabled]);
};

export const ValinnanTuloksetTable = ({
  haku,
  hakukohde,
  actorRef,
  hakemukset,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  actorRef: ValinnanTulosActorRef;
  hakemukset: Array<HakemuksenValinnanTulos>;
}) => {
  const { t } = useTranslations();

  const columns = useColumns({
    haku,
    hakukohde,
    actorRef,
  });

  const { results, sort, setSort, pageSize, setPage, page } =
    useValinnanTuloksetSearch(hakemukset);

  const { selection, setSelection, resetSelection } = useSelection(hakemukset);

  const changedHakemukset = useSelector(
    actorRef,
    (state) => state.context.changedHakemukset,
  );

  const rows = useMemo(() => {
    return results.map((hakemus) => {
      const changedTulos = changedHakemukset.find(
        (changedTulos) => changedTulos.hakemusOid === hakemus.hakemusOid,
      );

      return {
        ...hakemus,
        ...(changedTulos ?? {}),
      };
    });
  }, [results, changedHakemukset]);

  return (
    <>
      <ValinnanTulosActionBar
        selection={selection}
        hakemukset={rows}
        actorRef={actorRef}
        resetSelection={resetSelection}
      />
      <ListTable
        rowKeyProp="hakemusOid"
        columns={columns}
        rows={rows}
        selection={selection}
        onSelectionChange={setSelection}
        checkboxSelection={true}
        translateHeader={false}
        sort={sort}
        setSort={setSort}
        pagination={{
          page,
          setPage,
          pageSize,
          label: `${t('yleinen.sivutus')} ${hakukohde.nimi}`,
        }}
        getRowCheckboxLabel={({ hakijanNimi }) =>
          t(`${TRANSLATIONS_PREFIX}.valitse-hakemus`, {
            hakijanNimi,
          })
        }
      />
    </>
  );
};
