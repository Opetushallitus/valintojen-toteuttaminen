'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { useMemo } from 'react';
import { KeysMatching, ListTableColumn } from '@/components/table/table-types';
import { isNonNull } from 'remeda';
import { ValinnanTulosModel } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { Hakemus } from '@/lib/ataru/ataru-types';
import { useSelection } from '@/hooks/useSelection';

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
        renderFn: (props) => <div>{props.valinnantila}</div>,
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanoton-tila`),
        key: 'vastaanottotila',
        renderFn: (props) => <div>{props.vastaanottotila}</div>,
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumisen-tila`),
        key: 'ilmoittautumisTila',
        renderFn: (props) => <div>{props.ilmoittautumistila}</div>,
      }),
      makeColumnWithCustomRender<HakemusValinnanTuloksilla>({
        title: t(`${TRANSLATIONS_PREFIX}.toiminnot`),
        key: 'toiminnot',
        renderFn: () => <div></div>,
        sortable: false,
      }),
    ].filter(isNonNull);
  }, [t]);
};

type HakemusValinnanTuloksilla = Hakemus & Partial<ValinnanTulosModel>;

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
