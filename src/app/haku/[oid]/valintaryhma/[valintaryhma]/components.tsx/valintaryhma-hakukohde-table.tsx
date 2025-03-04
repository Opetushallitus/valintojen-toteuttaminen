'use client';

import { NoResults } from '@/components/no-results';
import { ListTable } from '@/components/table/list-table';
import {
  makeExternalLinkColumn,
  makeGenericColumn,
} from '@/components/table/table-columns';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHakukohdeSortAndPaging } from '../hooks/useHakukohdeSortAndPaging';
import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';

export type HakukohdeWithLink = {
  oid: string;
  name: string;
  link: string;
  dateLaskettu?: string;
};

type ValintaryhmaHakukohdeTableProps = {
  hakukohteet: Array<HakukohdeWithLink>;
};

export const ValintaryhmaHakukohdeTable = ({
  hakukohteet,
}: ValintaryhmaHakukohdeTableProps) => {
  const { t } = useTranslations();
  const {
    results,
    sort,
    setSort,
    pageResults,
    pageSize,
    setPage,
    page,
    setPageSize,
  } = useHakukohdeSortAndPaging(hakukohteet);

  const nameColumn = makeExternalLinkColumn<HakukohdeWithLink>({
    title: 'valintaryhmittain.hakukohteet',
    key: 'name',
    linkProp: 'link',
    nameProp: 'name',
    linkBuilder: (row) => row,
  });

  const valintalaskentaDoneColumn = makeGenericColumn<HakukohdeWithLink>({
    title: 'valintaryhmittain.tehty',
    key: 'dateLaskettu',
    valueProp: 'dateLaskettu',
  });

  const columns = [nameColumn, valintalaskentaDoneColumn];

  return results.length < 1 ? (
    <NoResults text={t('valintaryhmittain.ei-hakukohteita')} />
  ) : (
    <TablePaginationWrapper
      totalCount={results?.length ?? 0}
      pageSize={pageSize}
      setPageSize={setPageSize}
      setPageNumber={setPage}
      pageNumber={page}
      countTranslationKey="valintaryhmittain.hakukohde-maara"
    >
      <ListTable
        rowKeyProp="oid"
        columns={columns}
        rows={pageResults}
        sort={sort}
        setSort={setSort}
      />
    </TablePaginationWrapper>
  );
};
