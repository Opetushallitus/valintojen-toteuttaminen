'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
  makeCountColumn,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import {
  SijoitteluajonValintatapajonoValintatiedoilla,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTulosActorRef,
} from '@/lib/types/sijoittelu-types';
import { useCallback, useMemo } from 'react';
import { KeysMatching, ListTableColumn } from '@/components/table/table-types';
import { MaksuCell } from './maksu-cell';
import { IlmoittautumisTilaSelect } from '@/components/ilmoittautumistila-select';
import { VastaanOttoCell } from '@/components/vastaanotto-cell';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { SijoittelunTuloksetActionBar } from './sijoittelun-tulos-action-bar';
import { ValinnanTulosOtherActionsCell } from '@/components/valinnan-tulos-other-actions-cell';
import { useSelector } from '@xstate/react';
import { isNonNull } from 'remeda';
import { useSijoittelunTulosSearch } from '../hooks/useSijoittelunTulosSearch';
import { useSelection } from '@/hooks/useSelection';
import {
  ValinnanTulosChangeParams,
  ValinnanTulosEventType,
  ValinnanTulosState,
} from '@/lib/state/valinnan-tulos-machine';
import { ValinnanTilaCell } from '@/components/valinnan-tila-cell';

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

const useColumns = ({
  haku,
  hakukohde,
  sijoitteluajoId,
  actorRef,
  kaikkiJonotHyvaksytty,
  valintatapajono,
  kayttaaLaskentaa,
  hasNegativePisteet,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  actorRef: SijoittelunTulosActorRef;
  kaikkiJonotHyvaksytty: boolean;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  kayttaaLaskentaa: boolean;
  hasNegativePisteet: boolean;
}) => {
  const state = useSelector(actorRef, (s) => s);
  const { send } = actorRef;

  const { t } = useTranslations();

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
      kayttaaLaskentaa || !hasNegativePisteet
        ? makeCountColumn<SijoittelunHakemusValintatiedoilla>({
            title: t(`${TRANSLATIONS_PREFIX}.pisteet`),
            key: 'pisteet',
            amountProp: 'pisteet',
          })
        : null,
      makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.tila`),
        key: 'sijoittelunTila',
        renderFn: (props) => (
          <ValinnanTilaCell
            hakemus={props}
            haku={haku}
            updateForm={updateForm}
            disabled={disabled}
            mode="sijoittelu"
          />
        ),
      }),
      makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanottotieto`),
        key: 'vastaanottotila',
        renderFn: (props) => (
          <VastaanOttoCell
            haku={haku}
            hakukohde={hakukohde}
            valintatapajono={valintatapajono}
            hakemus={props}
            updateForm={updateForm}
            disabled={disabled}
            mode="sijoittelu"
          />
        ),
      }),
      makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumistieto`),
        key: 'ilmoittautumisTila',
        renderFn: (props) => (
          <IlmoittautumisTilaSelect
            hakemus={props}
            updateForm={updateForm}
            disabled={disabled}
          />
        ),
      }),
      isKorkeakouluHaku(haku)
        ? makeColumnWithCustomRender<SijoittelunHakemusValintatiedoilla>({
            title: t(`${TRANSLATIONS_PREFIX}.maksuntila`),
            key: 'maksunTila',
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
          <ValinnanTulosOtherActionsCell
            haku={haku}
            hakemus={props}
            hakukohde={hakukohde}
            disabled={disabled}
            sijoitteluajoId={sijoitteluajoId}
            kaikkiJonotHyvaksytty={kaikkiJonotHyvaksytty}
          />
        ),
        sortable: false,
      }),
    ].filter(isNonNull);
  }, [
    t,
    haku,
    updateForm,
    disabled,
    sijoitteluajoId,
    hakukohde,
    kaikkiJonotHyvaksytty,
    valintatapajono,
    kayttaaLaskentaa,
    hasNegativePisteet,
  ]);
};

export const SijoittelunTulosTable = ({
  haku,
  hakukohde,
  sijoitteluajoId,
  valintatapajono,
  sijoittelunTulosActorRef,
  kaikkiJonotHyvaksytty,
  kayttaaLaskentaa,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  sijoittelunTulosActorRef: SijoittelunTulosActorRef;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  kaikkiJonotHyvaksytty: boolean;
  kayttaaLaskentaa: boolean;
}) => {
  const { t } = useTranslations();

  const contextHakemukset = useSelector(
    sijoittelunTulosActorRef,
    (state) => state.context.hakemukset,
  );

  const {
    results: hakemukset,
    sort,
    setSort,
    pageSize,
    setPage,
    page,
  } = useSijoittelunTulosSearch(valintatapajono.oid, contextHakemukset);

  const columns = useColumns({
    haku,
    hakukohde,
    sijoitteluajoId,
    actorRef: sijoittelunTulosActorRef,
    kaikkiJonotHyvaksytty,
    valintatapajono,
    kayttaaLaskentaa,
    hasNegativePisteet: valintatapajono.hasNegativePisteet,
  });

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

  const { selection, setSelection, resetSelection } = useSelection(hakemukset);

  return (
    <>
      <SijoittelunTuloksetActionBar
        hakemukset={contextHakemukset}
        selection={selection}
        resetSelection={resetSelection}
        actorRef={sijoittelunTulosActorRef}
      />
      <ListTable
        rowKeyProp="hakemusOid"
        columns={columns}
        rows={rows}
        sort={sort}
        setSort={setSort}
        checkboxSelection={true}
        selection={selection}
        pagination={{
          page,
          setPage,
          pageSize,
          label: `${t('yleinen.sivutus')} ${valintatapajono.nimi}`,
        }}
        setSelection={setSelection}
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
