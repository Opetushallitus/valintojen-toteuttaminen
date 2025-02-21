'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import { ListTableColumn } from '@/app/components/table/table-types';
import {
  createHakijaColumn,
  makeColumnWithCustomRender,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { ValintakoekutsuHakijoittain } from '@/app/lib/select-valintakoekutsut';
import { Valintakoe } from '@/app/lib/types/valintaperusteet-types';
import { makePaginationId } from '../hooks/useValintakoekutsutPaginated';

export const ValintakoekutsutHakijoittainTable = ({
  kokeet = [],
  data,
  sort,
  setSort,
  page,
  setPage,
  pageSize,
}: {
  kokeet: Array<Valintakoe>;
  data: Array<ValintakoekutsuHakijoittain>;
  sort: string;
  setSort: (sort: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}) => {
  const { t } = useTranslations();

  const columns: Array<ListTableColumn<ValintakoekutsuHakijoittain>> = useMemo(
    () => [
      createHakijaColumn(),
      ...kokeet.map((koe) =>
        makeColumnWithCustomRender<ValintakoekutsuHakijoittain>({
          title: koe.nimi,
          key: makePaginationId(koe.nimi),
          renderFn: (props) => {
            const osallistuminen =
              props.kutsut[koe.selvitettyTunniste]?.osallistuminen;
            return <span>{osallistuminen ? t(osallistuminen) : ''}</span>;
          },
          sortable: false,
        }),
      ),
    ],
    [kokeet, t],
  );

  return (
    <Box>
      <ListTable
        rowKeyProp="hakemusOid"
        columns={columns}
        rows={data}
        sort={sort}
        setSort={setSort}
        pagination={{
          page,
          setPage,
          pageSize,
        }}
      />
    </Box>
  );
};
