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
import { HakemusValinnanTuloksilla } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { useValinnanTulosActorRef } from '../lib/valinnan-tulos-state';
import { useSelector } from '@xstate/react';
import {
  ValinnanTulosActorRef,
  ValinnanTulosChangeParams,
  ValinnanTulosEventType,
  ValinnanTulosState,
} from '@/lib/state/valinnan-tulos-machine';

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
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.valinnan-tila`),
        key: 'valinnantila',
        renderFn: ({ valinnanTulos }) =>
          valinnanTulos && <div>{valinnanTulos.valinnanTila}</div>,
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanoton-tila`),
        key: 'vastaanottotila',
        renderFn: ({ hakemusOid, valinnanTulos }) =>
          valinnanTulos && (
            <VastaanOttoCell
              haku={haku}
              hakukohde={hakukohde}
              hakemus={{
                hakemusOid,
                valinnanTila: valinnanTulos.valinnanTila,
                vastaanottoTila: valinnanTulos.vastaanottoTila,
                julkaistavissa: valinnanTulos.julkaistavissa,
              }}
              updateForm={updateForm}
              disabled={disabled}
            />
          ),
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumisen-tila`),
        key: 'ilmoittautumisTila',
        renderFn: ({ hakemusOid, valinnanTulos }) => {
          return (
            valinnanTulos && (
              <IlmoittautumisTilaSelect
                hakemus={{
                  hakemusOid,
                  ilmoittautumisTila: valinnanTulos.ilmoittautumisTila,
                  valinnanTila: valinnanTulos.valinnanTila,
                  vastaanottoTila: valinnanTulos.vastaanottoTila,
                  julkaistavissa: valinnanTulos.julkaistavissa,
                }}
                updateForm={updateForm}
                disabled={disabled}
              />
            )
          );
        },
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.toiminnot`),
        key: 'toiminnot',
        renderFn: () => <div></div>,
        sortable: false,
      }),
    ];
  }, [t, haku, hakukohde, updateForm, disabled]);
};

export const ValinnanTuloksetTable = ({
  haku,
  hakukohde,
  lastModified,
  hakemukset,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  lastModified?: string;
  hakemukset: Array<HakemusValinnanTuloksilla>;
}) => {
  const { t } = useTranslations();

  const onUpdated = useCallback(() => {}, []);

  const valinnanTulosActorRef = useValinnanTulosActorRef({
    hakukohdeOid: hakukohde.oid,
    hakemukset,
    lastModified,
    onUpdated,
  });

  const columns = useColumns({
    haku,
    hakukohde,
    actorRef: valinnanTulosActorRef,
  });

  const { results, sort, setSort, pageSize, setPage, page } =
    useValinnanTuloksetSearch(hakemukset);

  const { selection, setSelection } = useSelection(hakemukset);

  const changedTulokset = useSelector(
    valinnanTulosActorRef,
    (state) => state.context.changedTulokset,
  );

  const rows = useMemo(() => {
    return results.map((hakemus) => {
      const changedTulos = changedTulokset.find(
        (changedTulos) => changedTulos.hakemusOid === hakemus.hakemusOid,
      );

      const valinnanTulos = hakemus.valinnanTulos;

      return {
        ...hakemus,
        valinnanTulos:
          changedTulos || valinnanTulos
            ? {
                hakemusOid: hakemus.hakemusOid,
                hakijanNimi: hakemus.hakijanNimi,
                ...valinnanTulos,
                ...changedTulos,
              }
            : undefined,
      };
    });
  }, [results, changedTulokset]);

  return (
    <>
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
