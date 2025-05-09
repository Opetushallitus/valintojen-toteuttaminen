'use client';

import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import React, { useMemo } from 'react';
import { OphPagination } from './oph-pagination';
import { ophColors } from '@opetushallitus/oph-design-system';
import { TableHeaderCell } from './table-header-cell';
import { EMPTY_ARRAY, EMPTY_STRING_SET } from '@/lib/common';
import {
  SelectionProps,
  TableHeaderCheckbox,
  TableRowCheckbox,
} from './table-checkboxes';
import { ListTableColumn, Row } from './table-types';
import { DEFAULT_BOX_BORDER, styled } from '@/lib/theme';

const StyledTable = styled(Table)({
  width: '100%',
});

const StyledTableBody = styled(TableBody)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: theme.spacing(1, 0, 1, 2),
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    height: '64px',
    borderWidth: 0,
  },
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.grey50,
      },
    },
    '&:nth-of-type(odd)': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.white,
      },
    },
    '&:hover': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.lightBlue2,
      },
    },
  },
}));
export type ListTablePaginationProps = {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  label?: string;
};

interface ListTableProps<T extends Row>
  extends React.ComponentProps<typeof StyledTable> {
  columns?: Array<ListTableColumn<T>>;
  rows?: Array<T>;
  sort?: string;
  setSort?: (sort: string) => void;
  translateHeader?: boolean;
  rowKeyProp: keyof T;
  pagination?: ListTablePaginationProps;
  getRowCheckboxLabel?: (row: T) => string;
  checkboxSelection?: boolean;
  selection?: SelectionProps['selection'];
  setSelection?: SelectionProps['setSelection'];
}

const TableWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'block',
  overflowX: 'auto',
  rowGap: theme.spacing(1),
  alignSelf: 'stretch',
}));

const TablePagination = ({
  label,
  totalCount,
  pageSize,
  page,
  setPage,
}: {
  label?: string;
  totalCount: number;
  pageSize: number;
  page: number;
  setPage: (newPage: number) => void;
}) => {
  const { t } = useTranslations();

  return (
    <OphPagination
      aria-label={label ?? t('yleinen.sivutus')}
      totalCount={totalCount}
      pageSize={pageSize}
      pageNumber={page}
      setPageNumber={setPage}
      previousText={t('yleinen.edellinen')}
      nextText={t('yleinen.seuraava')}
    />
  );
};

export const ListTable = <T extends Row>({
  columns = EMPTY_ARRAY as Array<ListTableColumn<T>>,
  rows = EMPTY_ARRAY as Array<T>,
  sort,
  setSort,
  rowKeyProp,
  translateHeader = true,
  pagination,
  checkboxSelection,
  selection = EMPTY_STRING_SET,
  setSelection,
  getRowCheckboxLabel,
  ...props
}: ListTableProps<T>) => {
  const { t } = useTranslations();

  const pageRows = useMemo(() => {
    if (pagination) {
      const start = pagination?.pageSize * (pagination.page - 1);
      return rows.slice(start, start + pagination.pageSize);
    }
    return rows;
  }, [rows, pagination]);

  return (
    <Stack spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
      <TableWrapper tabIndex={0}>
        <StyledTable {...props}>
          <TableHead>
            <TableRow sx={{ borderBottom: DEFAULT_BOX_BORDER }}>
              {checkboxSelection && (
                <TableHeaderCell
                  key="select-all"
                  title={
                    <TableHeaderCheckbox
                      selection={selection}
                      setSelection={setSelection}
                      rows={rows}
                      rowKeyProp={rowKeyProp}
                    />
                  }
                />
              )}
              {columns.map((columnProps) => {
                const { key, title, style, sortable } = columnProps;
                return (
                  <TableHeaderCell
                    key={key.toString()}
                    colId={key.toString()}
                    title={translateHeader ? t(title ?? '') : title}
                    style={style}
                    sort={sort}
                    setSort={setSort}
                    sortable={sortable != false}
                  />
                );
              })}
            </TableRow>
          </TableHead>
          <StyledTableBody>
            {pageRows.map((rowProps) => {
              const rowId = rowProps?.[rowKeyProp] as string;
              return (
                <TableRow key={rowId}>
                  {checkboxSelection && (
                    <TableCell>
                      <TableRowCheckbox
                        checked={selection.has(rowId)}
                        setSelection={setSelection}
                        rowId={rowId}
                        label={getRowCheckboxLabel?.(rowProps)}
                      />
                    </TableCell>
                  )}
                  {columns.map(({ key: columnKey, render, style }) => {
                    return (
                      <TableCell key={columnKey.toString()} sx={style}>
                        {render(rowProps)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </StyledTableBody>
        </StyledTable>
      </TableWrapper>
      {pagination && (
        <TablePagination
          label={pagination.label}
          page={pagination.page}
          setPage={pagination.setPage}
          pageSize={pagination.pageSize}
          totalCount={rows?.length ?? 0}
        />
      )}
    </Stack>
  );
};
