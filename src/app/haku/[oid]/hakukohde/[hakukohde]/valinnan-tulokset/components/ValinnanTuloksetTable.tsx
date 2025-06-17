'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { useCallback, useMemo } from 'react';
import { useSelection } from '@/hooks/useSelection';
import { IlmoittautumisTilaSelect } from '@/components/IlmoittautumisTilaSelect';
import { VastaanottoTilaCell } from '@/components/VastaanottoTilaCell';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { useValinnanTuloksetSearch } from '../hooks/useValinnanTuloksetSearch';
import { useSelector } from '@xstate/react';
import { ValinnanTulosActorRef } from '@/lib/state/createValinnanTuloksetMachine';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { ValinnanTilaCell } from '@/components/ValinnanTilaCell';
import { ValinnanTuloksetActionBar } from './ValinnanTuloksetActionBar';
import { ValinnanTuloksetOtherActionsCell } from '@/components/ValinnanTuloksetOtherActionsCell';
import {
  ValinnanTulosChangeParams,
  ValinnanTulosEventType,
  ValinnanTulosState,
} from '@/lib/state/valinnanTuloksetMachineTypes';

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
  const { t, translateEntity } = useTranslations();

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
            hakukohde={hakukohde}
            hakemus={hakemus}
            disabled={disabled}
            updateForm={updateForm}
            mode="valinta"
            t={t}
            translateEntity={translateEntity}
          />
        ),
      }),
      makeColumnWithCustomRender<HakemuksenValinnanTulos>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanoton-tila`),
        key: 'vastaanottotila',
        renderFn: (hakemus) => (
          <VastaanottoTilaCell
            haku={haku}
            hakukohde={hakukohde}
            hakemus={hakemus}
            updateForm={updateForm}
            disabled={disabled}
            mode="valinta"
            t={t}
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
            <ValinnanTuloksetOtherActionsCell
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
    translateEntity,
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
      <ValinnanTuloksetActionBar
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
