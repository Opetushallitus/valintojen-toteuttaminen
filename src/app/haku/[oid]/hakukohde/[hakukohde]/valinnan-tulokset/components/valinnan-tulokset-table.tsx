'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { useMemo } from 'react';
import { KeysMatching, ListTableColumn } from '@/components/table/table-types';
import { useSelection } from '@/hooks/useSelection';
import { IlmoittautumisTilaSelect } from '@/components/ilmoittautumistila-select';
import { HakemusValinnanTuloksilla } from '../lib/valinnan-tulos-types';

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

const useColumns = () => {
  const { t } = useTranslations();
  return useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn(t);
    return [
      stickyHakijaColumn,
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.valinnan-tila`),
        key: 'valinnantila',
        renderFn: ({ valinnanTulos }) =>
          valinnanTulos && <div>{valinnanTulos.valinnantila}</div>,
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanoton-tila`),
        key: 'vastaanottotila',
        renderFn: ({ valinnanTulos }) =>
          valinnanTulos && <div>{valinnanTulos.vastaanottotila}</div>,
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumisen-tila`),
        key: 'ilmoittautumisTila',
        renderFn: ({ hakijanNimi, hakemusOid, valinnanTulos }) => {
          console.log({ hakijanNimi, valinnanTulos });
          return (
            valinnanTulos && (
              <IlmoittautumisTilaSelect
                hakemus={{
                  hakemusOid,
                  ilmoittautumisTila: valinnanTulos.ilmoittautumisTila,
                  tila: valinnanTulos.valinnantila,
                  vastaanottotila: valinnanTulos.vastaanottotila,
                  julkaistavissa: valinnanTulos.julkaistavissa,
                }}
                updateForm={() => {}}
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
  }, [t]);
};

export const ValinnanTuloksetTable = ({
  hakemukset,
}: {
  hakemukset: Array<HakemusValinnanTuloksilla>;
}) => {
  const { t } = useTranslations();

  const columns = useColumns();

  const { selection, setSelection } = useSelection(hakemukset);

  return (
    <>
      <ListTable
        rowKeyProp="hakemusOid"
        columns={columns}
        rows={hakemukset}
        selection={selection}
        onSelectionChange={setSelection}
        checkboxSelection={true}
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
