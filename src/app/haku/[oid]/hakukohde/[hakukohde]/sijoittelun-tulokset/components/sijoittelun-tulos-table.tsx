'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
  makeCountColumn,
} from '@/app/components/table/table-columns';
import {
  ListTable,
  ListTablePaginationProps,
} from '@/app/components/table/list-table';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { useCallback, useMemo, useState } from 'react';
import {
  KeysMatching,
  ListTableColumn,
} from '@/app/components/table/table-types';
import { MaksuCell } from './maksu-cell';
import { IlmoittautumisCell } from './ilmoittautumis-cell';
import { VastaanOttoCell } from './vastaanotto-cell';
import { SijoittelunTilaCell } from './sijoittelun-tila-cell';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { SijoittelunTuloksetActionBar } from './sijoittelun-tulos-action-bar';
import {
  HakemuksetStateChangeParams,
  SijoittelunTuloksetEventTypes,
  SijoittelunTuloksetStates,
  SijoittelunTulosActorRef,
  SijoittelunTulosChangeParams,
} from '../lib/sijoittelun-tulokset-state';
import { OtherActionsCell } from './other-actions-cell';
import { useSelector } from '@xstate/react';
import { isNonNull } from 'remeda';

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

const TRANSLATIONS_PREFIX = 'sijoittelun-tulokset.taulukko';

export const SijoittelunTulosTable = ({
  haku,
  hakukohde,
  hakemukset,
  sijoitteluajoId,
  setSort,
  sort,
  pagination,
  sijoittelunTulosActorRef,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  sijoitteluajoId: string;
  sort: string;
  setSort: (sort: string) => void;
  sijoittelunTulosActorRef: SijoittelunTulosActorRef;
  pagination: ListTablePaginationProps;
}) => {
  const { t } = useTranslations();

  const { send } = sijoittelunTulosActorRef;

  const state = useSelector(sijoittelunTulosActorRef, (s) => s);
  const disabled = !state.matches(SijoittelunTuloksetStates.IDLE);

  const updateForm = useCallback(
    (changeParams: SijoittelunTulosChangeParams) => {
      send({
        type: SijoittelunTuloksetEventTypes.ADD_CHANGED_HAKEMUS,
        ...changeParams,
      });
    },
    [send],
  );

  const massStatusChangeForm = (changeParams: HakemuksetStateChangeParams) => {
    send({
      type: SijoittelunTuloksetEventTypes.CHANGE_HAKEMUKSET_STATES,
      ...changeParams,
    });
  };

  const columns = useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn('sijoittelun-tulos', t);
    return [
      makeEmptyCountColumn<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.jonosija`),
        key: 'sija',
        amountProp: 'sija',
      }),
      stickyHakijaColumn,
      makeCountColumn<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.hakutoive`),
        key: 'hakutoive',
        amountProp: 'hakutoive',
      }),
      makeCountColumn<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.pisteet`),
        key: 'pisteet',
        amountProp: 'pisteet',
      }),
      makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.tila`),
        key: 'sijoittelunTila',
        renderFn: (props) => (
          <SijoittelunTilaCell
            hakemus={props}
            haku={haku}
            updateForm={updateForm}
            disabled={disabled}
          />
        ),
      }),
      makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanottotieto`),
        key: 'vastaanottotila',
        renderFn: (props) => (
          <VastaanOttoCell
            haku={haku}
            hakemus={props}
            updateForm={updateForm}
            disabled={disabled}
          />
        ),
      }),
      makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumistieto`),
        key: 'ilmoittautumisTila',
        renderFn: (props) => (
          <IlmoittautumisCell
            hakemus={props}
            updateForm={updateForm}
            disabled={disabled}
          />
        ),
      }),
      isKorkeakouluHaku(haku)
        ? makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
            title: t(`${TRANSLATIONS_PREFIX}.maksuntila`),
            key: 'maksuntila',
            renderFn: (props) => (
              <MaksuCell
                hakemus={props}
                updateForm={updateForm}
                disabled={disabled}
              />
            ),
          })
        : null,
      makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.toiminnot`),
        key: 'toiminnot',
        renderFn: (props) => (
          <OtherActionsCell
            hakemus={props}
            hakukohde={hakukohde}
            disabled={disabled}
            sijoitteluajoId={sijoitteluajoId}
          />
        ),
        sortable: false,
      }),
    ].filter(isNonNull);
  }, [t, haku, updateForm, disabled, sijoitteluajoId, hakukohde]);

  const [selection, setSelection] = useState<Set<string>>(() => new Set());

  const changedHakemukset = useSelector(
    sijoittelunTulosActorRef,
    (state) => state.context.changedHakemukset,
  );

  const rows = useMemo(
    () =>
      hakemukset.map((hakemus) => {
        const changedHakemus =
          changedHakemukset.find(
            (changedHakemus) =>
              changedHakemus.hakemusOid === hakemus.hakemusOid,
          ) ?? {};
        return {
          ...hakemus,
          ...changedHakemus,
        };
      }),
    [hakemukset, changedHakemukset],
  );

  return (
    <>
      <SijoittelunTuloksetActionBar
        hakemukset={hakemukset}
        selection={selection}
        resetSelection={() => setSelection(new Set())}
        massStatusChangeForm={massStatusChangeForm}
      />
      <ListTable
        rowKeyProp="hakemusOid"
        columns={columns}
        rows={rows}
        sort={sort}
        setSort={setSort}
        checkboxSelection={true}
        selection={selection}
        pagination={pagination}
        onSelectionChange={setSelection}
        translateHeader={false}
        getRowCheckboxLabel={({ hakijanNimi }) =>
          t(`${TRANSLATIONS_PREFIX}.valitse-hakemus`, {
            hakijanNimi,
          })
        }
      />
    </>
  );
};
