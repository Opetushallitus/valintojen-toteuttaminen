'use client';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  hakijaColumn,
  makeCountColumn,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { SijoittelunHakemusEnriched } from '@/app/lib/types/sijoittelu-types';
import { useMemo } from 'react';

const stickyColumnStyle: React.CSSProperties = {
  minWidth: '260px',
  position: 'sticky',
  left: 0,
  boxShadow: `0 5px 3px 2px ${ophColors.grey200}`,
  zIndex: 1,
  backgroundColor: ophColors.white,
};

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
    const stickyHakijaColumn = Object.assign(hakijaColumn, {
      style: stickyColumnStyle,
      title: t('hakeneet.taulukko.hakija'),
    });
    return [
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: `${TRANSLATIONS_PREFIX}.jonosija`,
        key: 'jonosija',
        amountProp: 'jonosija',
      }),
      stickyHakijaColumn,
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: `${TRANSLATIONS_PREFIX}.hakutoive`,
        key: 'hakutoive',
        amountProp: 'hakutoive',
      }),
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: `${TRANSLATIONS_PREFIX}.pisteet`,
        key: 'pisteet',
        amountProp: 'pisteet',
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
    />
  );
};
