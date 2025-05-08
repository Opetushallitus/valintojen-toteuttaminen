'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { useCallback, useMemo } from 'react';
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
import { ValinnanTulosOtherActionsCell } from '@/components/valinnan-tulos-other-actions-cell';

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

  const disabled = useSelector(
    actorRef,
    (s) => !s.matches(ValinnanTulosState.IDLE),
  );
  const { send } = actorRef;

  const valintatapajonoOid = useSelector(
    actorRef,
    (s) => s.context.valintatapajonoOid,
  );

  const updateForm = useCallback(
    (changeParams: ValinnanTulosChangeParams) => {
      send({
        type: ValinnanTulosEventType.CHANGE,
        ...changeParams,
      });
    },
    [send],
  );

  const removeValinnanTulos = useCallback(
    (hakemusOid: string) => {
      send({
        type: ValinnanTulosEventType.REMOVE,
        hakemusOid,
      });
    },
    [send],
  );

  return useMemo(() => {
    return [
      createStickyHakijaColumn(t),
      makeColumnWithCustomRender<HakemuksenValinnanTulos>({
        title: t(`${TRANSLATIONS_PREFIX}.valinnan-tila`),
        key: 'valinnantila',
        renderFn: (hakemus) => (
          <ValinnanTilaCell
            haku={haku}
            hakemus={hakemus}
            disabled={disabled}
            updateForm={updateForm}
            mode="valinta"
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
            mode="valinta"
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
        renderFn: (hakemus) =>
          valintatapajonoOid && (
            <ValinnanTulosOtherActionsCell
              haku={haku}
              hakukohde={hakukohde}
              hakemus={hakemus}
              disabled={disabled}
              kaikkiJonotHyvaksytty={true}
              removeValinnanTulos={removeValinnanTulos}
              valintatapajonoOid={valintatapajonoOid}
            />
          ),
        sortable: false,
      }),
    ];
  }, [
    t,
    haku,
    hakukohde,
    updateForm,
    disabled,
    valintatapajonoOid,
    removeValinnanTulos,
  ]);
};

export const ValinnanTuloksetTable = ({
  haku,
  hakukohde,
  actorRef,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  actorRef: ValinnanTulosActorRef;
}) => {
  const { t } = useTranslations();

  const columns = useColumns({
    haku,
    hakukohde,
    actorRef,
  });

  const { hakemukset, changedHakemukset } = useSelector(actorRef, (state) => ({
    hakemukset: state.context.hakemukset,
    changedHakemukset: state.context.changedHakemukset,
  }));

  const { results, sort, setSort, pageSize, setPage, page } =
    useValinnanTuloksetSearch(hakemukset);

  const { selection, setSelection, resetSelection } = useSelection(hakemukset);

  const rows = useMemo(() => {
    return results.map((hakemus) => {
      const changedHakemus = changedHakemukset.find(
        (h) => h.hakemusOid === hakemus.hakemusOid,
      );

      return changedHakemus ?? hakemus;
    });
  }, [results, changedHakemukset]);

  const getRowCheckboxLabel = useCallback(
    ({ hakijanNimi }: HakemuksenValinnanTulos) => {
      return t(`sijoittelun-tulokset.taulukko.valitse-hakemus`, {
        hakijanNimi,
      });
    },
    [t],
  );

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
        setSelection={setSelection}
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
        getRowCheckboxLabel={getRowCheckboxLabel}
      />
    </>
  );
};
