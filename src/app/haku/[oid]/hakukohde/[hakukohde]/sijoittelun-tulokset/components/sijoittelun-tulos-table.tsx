'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
  makeCountColumn,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { SijoittelunHakemusEnriched } from '@/app/lib/types/sijoittelu-types';
import { useMemo } from 'react';

const TRANSLATIONS_PREFIX = 'sijoittelun-tulokset.taulukko';

export const SijoittelunTulosTable = ({
  hakemukset,
  setSort,
  sort,
}: {
  hakemukset: SijoittelunHakemusEnriched[];
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const { t } = useTranslations();

  const columns = useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn('sijoittelun-tulos', t);
    return [
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.jonosija`),
        key: 'jonosija',
        amountProp: 'jonosija',
      }),
      stickyHakijaColumn,
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.hakutoive`),
        key: 'hakutoive',
        amountProp: 'hakutoive',
      }),
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.pisteet`),
        key: 'pisteet',
        amountProp: 'pisteet',
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.tila`),
        key: 'sijoittelunTila',
        renderFn: (props) => <span>{t(`sijoitteluntila.${props.tila}`)}</span>,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanottotieto`),
        key: 'vastaanottotila',
        renderFn: (props) => <span>{props.vastaanottotila}</span>,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumistieto`),
        key: 'ilmoittautumisTila',
        renderFn: (props) => <span>{props.ilmoittautumisTila}</span>,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.maksuntila`),
        key: 'maksuntila',
        renderFn: () => <span></span>,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.toiminnot`),
        key: 'toiminnot',
        renderFn: () => <span>...</span>,
      }),
    ];
  }, [t]);

  return (
    <ListTable
      rowKeyProp="hakijaOid"
      columns={columns}
      rows={hakemukset}
      sort={sort}
      setSort={setSort}
      translateHeader={false}
      sx={{ overflowX: 'auto', width: 'unset' }}
      wrapperStyle={{ display: 'block' }}
    />
  );
};
