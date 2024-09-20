'use client';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useMemo } from 'react';
import { hakijaColumn } from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { SijoittelunHakemusEnriched } from '@/app/lib/types/sijoittelu-types';

const stickyColumnStyle: React.CSSProperties = {
  minWidth: '260px',
  position: 'sticky',
  left: 0,
  boxShadow: `0 5px 3px 2px ${ophColors.grey200}`,
  zIndex: 1,
  backgroundColor: ophColors.white,
};

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

    return [stickyHakijaColumn];
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
