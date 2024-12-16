'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { HakuListItem } from '@/app/hooks/useHakuSearch';
import { useMemo } from 'react';
import { ListTableColumn } from '@/app/components/table/table-types';
import { makeCountColumn } from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { OphLink } from '@opetushallitus/oph-design-system';
import { isTranslatedName } from '@/app/lib/localization/translation-utils';

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
          <OphLink href={`/haku/${haku.oid}`} sx={{ textDecoration: 'none' }}>
            {isTranslatedName(haku.nimi)
              ? translateEntity(haku.nimi)
              : haku.nimi}
          </OphLink>
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
