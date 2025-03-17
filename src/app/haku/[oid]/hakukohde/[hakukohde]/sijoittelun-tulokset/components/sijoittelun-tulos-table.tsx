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
} from '@/lib/types/sijoittelu-types';
import { useCallback, useMemo, useState } from 'react';
import { KeysMatching, ListTableColumn } from '@/components/table/table-types';
import { MaksuCell } from './maksu-cell';
import { IlmoittautumisCell } from './ilmoittautumis-cell';
import { VastaanOttoCell } from './vastaanotto-cell';
import { SijoittelunTilaCell } from './sijoittelun-tila-cell';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { SijoittelunTuloksetActionBar } from './sijoittelun-tulos-action-bar';
import { OtherActionsCell } from './other-actions-cell';
import { useSelector } from '@xstate/react';
import { isNonNull } from 'remeda';
import {
  MassChangeParams,
  SijoittelunTuloksetEventType,
  SijoittelunTuloksetState,
  SijoittelunTulosActorRef,
  SijoittelunTulosChangeParams,
} from '../lib/sijoittelun-tulokset-state';
import { useSijoittelunTulosSearch } from '../hooks/useSijoittelunTulosSearch';

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
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  actorRef: SijoittelunTulosActorRef;
  kaikkiJonotHyvaksytty: boolean;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  kayttaaLaskentaa: boolean;
}) => {
  const state = useSelector(actorRef, (s) => s);
  const { send } = actorRef;

  const { t } = useTranslations();

  const disabled = !state.matches(SijoittelunTuloksetState.IDLE);

  const updateForm = useCallback(
    (changeParams: SijoittelunTulosChangeParams) => {
      send({
        type: SijoittelunTuloksetEventType.CHANGE,
        ...changeParams,
      });
    },
    [send],
  );

  return useMemo(() => {
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
      kayttaaLaskentaa
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
            hakukohde={hakukohde}
            valintatapajono={valintatapajono}
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
          <OtherActionsCell
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

  const [selection, setSelection] = useState<Set<string>>(() => new Set());

  return (
    <>
      <SijoittelunTuloksetActionBar
        hakemukset={contextHakemukset}
        selection={selection}
        resetSelection={() => setSelection(new Set())}
        massStatusChangeForm={(changeParams: MassChangeParams) => {
          sijoittelunTulosActorRef.send({
            type: SijoittelunTuloksetEventType.MASS_CHANGE,
            ...changeParams,
          });
        }}
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
