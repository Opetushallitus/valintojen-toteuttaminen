'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { TFunction } from 'i18next';
import { ExternalLink } from '../external-link';
import { useMemo } from 'react';
import { OphPagination } from './oph-pagination';
import { ophColors } from '@opetushallitus/oph-design-system';
import { TableHeaderCell } from './table-header-cell';
import { EMPTY_ARRAY, EMPTY_STRING_SET } from '@/app/lib/common';
import { TableHeaderCheckbox, TableRowCheckbox } from './table-checkboxes';
import { KeysMatching, ListTableColumn, Row } from './table-types';

export const makeGenericColumn = <T extends Record<string, unknown>>({
  title,
  key,
  valueProp,
}: {
  title: string;
  key: string;
  valueProp: KeysMatching<T, string | number | undefined>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{props[valueProp] as string}</span>,
  style: { width: 'auto' },
});

export const makeColumnWithCustomRender = <T extends Record<string, unknown>>({
  title,
  key,
  renderFn,
  sortable = true,
}: {
  title: string;
  key: string;
  renderFn: (props: T) => React.ReactNode;
  sortable?: boolean;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => renderFn(props),
  sortable,
});

export const makeBooleanYesNoColumn = <T extends Record<string, unknown>>({
  t,
  title,
  key,
  booleanValueProp,
}: {
  t: TFunction;
  title: string;
  key: string;
  booleanValueProp: KeysMatching<T, boolean>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => (
    <span>
      {(props[booleanValueProp] as boolean)
        ? t('yleinen.kylla')
        : t('yleinen.ei')}
    </span>
  ),
  style: { width: 'auto' },
});

export const makeColumnWithValueToTranslate = <
  T extends Record<string, unknown>,
>({
  t,
  title,
  key,
  valueProp,
}: {
  t: TFunction;
  title: string;
  key: string;
  valueProp: KeysMatching<T, string>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{t(props[valueProp] as string)}</span>,
  style: { width: 'auto' },
});

export const makeCountColumn = <T extends Record<string, unknown>>({
  title,
  key,
  amountProp,
}: {
  title: string;
  key: string;
  amountProp: KeysMatching<T, number>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{(props[amountProp] ?? 0) as number}</span>,
  style: { width: 0 },
});

export const makeExternalLinkColumn = <T extends Record<string, unknown>>({
  linkBuilder,
  title,
  key,
  nameProp,
  linkProp,
}: {
  linkBuilder: (s: string) => string;
  title: string;
  key: string;
  nameProp?: KeysMatching<T, string>;
  linkProp: KeysMatching<T, string>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => (
    <ExternalLink
      noIcon={true}
      name={props[nameProp ?? linkProp] as string}
      href={linkBuilder(props[linkProp] as string)}
    />
  ),
  style: { width: 'auto' },
});

const StyledTable = styled(Table)({
  width: '100%',
  borderSpacing: '0px',
});

const StyledCell = styled(TableCell)({
  borderSpacing: '0px',
  padding: '0.6rem 0.8rem',
  textAlign: 'left',
  whiteSpace: 'pre-wrap',
  borderWidth: 0,
  'button:focus': {
    color: ophColors.blue2,
  },
});

const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      backgroundColor: ophColors.grey50,
      '.MuiTableCell-root': {
        backgroundColor: ophColors.grey50,
      },
    },
    '&:nth-of-type(odd)': {
      backgroundColor: ophColors.white,
      '.MuiTableCell-root': {
        backgroundColor: ophColors.white,
      },
    },
    '&:hover': {
      backgroundColor: ophColors.lightBlue2,
    },
  },
});

interface ListTableProps<T extends Row>
  extends React.ComponentProps<typeof StyledTable> {
  columns?: Array<ListTableColumn<T>>;
  rows?: Array<T>;
  sort?: string;
  setSort?: (sort: string) => void;
  translateHeader?: boolean;
  rowKeyProp: keyof T;
  pagination?: {
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
  };
  getRowCheckboxLabel?: (row: T) => string;
  checkboxSelection?: boolean;
  selection?: Set<string>;
  onSelectionChange?: (selection: Set<string>) => void;
}

const TableWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  overflowX: 'auto',
  rowGap: theme.spacing(1),
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
  setPage: (page: number) => void;
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
  onSelectionChange,
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
    <TableWrapper>
      <StyledTable {...props}>
        <TableHead>
          <TableRow sx={{ borderBottom: `2px solid ${ophColors.grey200}` }}>
            {checkboxSelection && (
              <TableHeaderCell
                key="select-all"
                title={
                  <TableHeaderCheckbox
                    selection={selection}
                    onSelectionChange={onSelectionChange}
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
                  <StyledCell>
                    <TableRowCheckbox
                      selection={selection}
                      onSelectionChange={onSelectionChange}
                      rowId={rowId}
                      rowProps={rowProps}
                      getRowCheckboxLabel={getRowCheckboxLabel}
                    />
                  </StyledCell>
                )}
                {columns.map(({ key: columnKey, render, style }) => {
                  return (
                    <StyledCell key={columnKey.toString()} sx={style}>
                      {render({ ...rowProps })}
                    </StyledCell>
                  );
                })}
              </TableRow>
            );
          })}
        </StyledTableBody>
      </StyledTable>
      {pagination && (
        <TablePagination
          page={pagination.page}
          setPage={pagination.setPage}
          pageSize={pagination.pageSize}
          totalCount={rows?.length ?? 0}
        />
      )}
    </TableWrapper>
  );
};

export default ListTable;
