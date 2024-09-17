'use client';

import {
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import { ExpandLess, ExpandMore, UnfoldMore } from '@mui/icons-material';
import { getSortParts } from './table-utils';
import { useTranslations } from '@/app/hooks/useTranslations';
import { TFunction } from 'i18next';
import { ExternalLink } from '../external-link';
import React, { useMemo } from 'react';
import { OphPagination } from './oph-pagination';
import { map, pipe } from 'remeda';
import { ophColors } from '@opetushallitus/oph-design-system';

type KeysMatching<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O & string];

export type ListTableColumn<P> = {
  title?: string;
  key: keyof P;
  render: (props: P) => React.ReactNode;
  style?: React.CSSProperties;
  sortable?: boolean;
};

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

const StyledHeaderCell = styled(TableCell)({
  padding: '0.2rem 0.1rem 0.2rem 0.4rem',
  textAlign: 'left',
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

const SortIcon = ({
  sortValue,
  colId = '',
}: {
  sortValue?: string;
  colId?: string;
}) => {
  switch (sortValue) {
    case `${colId}:asc`:
      return <ExpandLess />;
    case `${colId}:desc`:
      return <ExpandMore />;
    default:
      return <UnfoldMore />;
  }
};

const HeaderCell = ({
  colId,
  title,
  style,
  sort,
  setSort,
  sortable,
}: {
  colId?: string;
  title?: React.ReactNode;
  style?: React.CSSProperties;
  sort?: string;
  setSort?: (sort: string) => void;
  sortable?: boolean;
}) => {
  const { direction } = getSortParts(sort, colId);

  return (
    <StyledHeaderCell sx={style} sortDirection={direction}>
      {setSort && sortable ? (
        <Button
          sx={{
            color: ophColors.black,
          }}
          onClick={() => {
            let newSortValue = '';
            if (sort === `${colId}:asc`) {
              newSortValue = `${colId}:desc`;
            } else if (sort === `${colId}:desc`) {
              newSortValue = '';
            } else {
              newSortValue = `${colId}:asc`;
            }
            setSort(newSortValue);
          }}
          endIcon={<SortIcon sortValue={sort} colId={colId} />}
        >
          {title}
        </Button>
      ) : (
        <span style={{ fontWeight: 600 }}>{title}</span>
      )}
    </StyledHeaderCell>
  );
};

const TableWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  overflowX: 'auto',
  rowGap: theme.spacing(1),
}));

const ListCheckbox = styled(Checkbox)({
  padding: 0,
});

export type Row<K extends string = string> = Record<K, unknown>;

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

const EMPTY_SET: Set<string> = new Set();
const EMPTY_ARRAY: Array<unknown> = [];

export const ListTable = <T extends Row>({
  columns = EMPTY_ARRAY as Array<ListTableColumn<T>>,
  rows = EMPTY_ARRAY as Array<T>,
  sort,
  setSort,
  rowKeyProp,
  translateHeader = true,
  pagination,
  checkboxSelection,
  selection = EMPTY_SET,
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
              <HeaderCell
                key="select-all"
                title={
                  <ListCheckbox
                    checked={selection.size === rows.length}
                    indeterminate={
                      selection.size > 0 &&
                      selection.size !== rows.length &&
                      selection.size !== 0
                    }
                    inputProps={{ 'aria-label': t('yleinen.valitse-kaikki') }}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                      checked: boolean,
                    ) => {
                      if (checked) {
                        onSelectionChange?.(
                          pipe(
                            rows,
                            map((item) => item?.[rowKeyProp] as string),
                            (array) => new Set(array),
                          ),
                        );
                      } else {
                        onSelectionChange?.(EMPTY_SET);
                      }
                    }}
                  />
                }
              />
            )}
            {columns.map((columnProps) => {
              const { key, title, style, sortable } = columnProps;
              return (
                <HeaderCell
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
                    <ListCheckbox
                      checked={selection.has(rowId)}
                      inputProps={{
                        'aria-label': getRowCheckboxLabel?.(rowProps),
                      }}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                        checked: boolean,
                      ) => {
                        const newSelection = new Set(selection);
                        if (checked) {
                          newSelection.add(rowId);
                          onSelectionChange?.(newSelection);
                        } else {
                          newSelection.delete(rowId);
                          onSelectionChange?.(newSelection);
                        }
                      }}
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
