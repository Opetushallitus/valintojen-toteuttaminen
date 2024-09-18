'use client';
import ListTable, { makeCountColumn } from '../components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { HakuListItem } from '@/app/hooks/useHakuSearch';
import { Link } from '@mui/material';
import { useMemo } from 'react';
import { ListTableColumn } from '../components/table/table-types';

export const HakuTable = ({
  haut,
  setSort,
  sort,
}: {
  haut: Array<HakuListItem>;
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const { translateEntity } = useTranslations();

  const columns: Array<ListTableColumn<HakuListItem>> = useMemo(
    () => [
      {
        title: 'yleinen.nimi',
        key: 'nimi',
        render: (haku) => (
          <Link href={`/haku/${haku.oid}`} sx={{ textDecoration: 'none' }}>
            {typeof haku.nimi == 'object'
              ? translateEntity(haku.nimi)
              : haku.nimi}
          </Link>
        ),
        style: {
          width: 'auto',
        },
      },
      {
        title: 'yleinen.tila',
        key: 'tila',
        render: (haku) => <span>{haku.tila}</span>,
        style: {
          width: 0,
        },
      },
      {
        title: 'haku.hakutapa',
        key: 'hakutapaNimi',
        render: (haku) => <span>{translateEntity(haku?.hakutapaNimi)}</span>,
      },
      {
        title: 'haku.alkamiskausi',
        key: 'alkamiskausiNimi',
        render: (haku) => <span>{translateEntity(haku.alkamiskausiNimi)}</span>,
      },
      makeCountColumn<HakuListItem>({
        title: 'haku.hakukohteet',
        key: 'hakukohteita',
        amountProp: 'hakukohteita',
      }),
    ],
    [translateEntity],
  );

  return (
    <ListTable
      rowKeyProp="oid"
      columns={columns}
      rows={haut}
      sort={sort}
      setSort={setSort}
    />
  );
};
