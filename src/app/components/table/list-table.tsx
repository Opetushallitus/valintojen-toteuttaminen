'use client';

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import { colors } from '@/app/theme';
import { ExpandLess, ExpandMore, UnfoldMore } from '@mui/icons-material';
import { getSortParts } from './table-utils';
import { useTranslations } from '@/app/hooks/useTranslations';
import { TFunction } from 'i18next';
import { ExternalLink } from '../external-link';
import React, { Key } from 'react';

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
  padding: '1rem',
  textAlign: 'left',
  whiteSpace: 'pre-wrap',
  borderWidth: 0,
  'button:focus': {
    color: colors.blue2,
  },
});

const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      backgroundColor: colors.grey50,
    },
    '&:hover': {
      backgroundColor: colors.lightBlue2,
    },
  },
});

interface ListTableProps<T> extends React.ComponentProps<typeof StyledTable> {
  columns?: Array<ListTableColumn<T>>;
  rows?: Array<T>;
  sort?: string;
  setSort?: (sort: string) => void;
  translateHeader: boolean;
  rowKeyProp: keyof T;
}

const SortIcon = ({
  sortValue,
  colId,
}: {
  sortValue?: string;
  colId: string;
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
  colId: string;
  title?: string;
  style?: React.CSSProperties;
  sort?: string;
  setSort?: (sort: string) => void;
  sortable?: boolean;
}) => {
  const { direction } = getSortParts(sort, colId);

  return (
    <StyledCell sx={style} sortDirection={direction}>
      {setSort && sortable ? (
        <Button
          sx={{
            color: colors.black,
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
    </StyledCell>
  );
};

const TableWrapper = styled(Box)({
  position: 'relative',
  display: 'block',
  width: '100%',
  overflowX: 'auto',
});

export type Row<K extends string = string> = Record<K, unknown>;

export const ListTable = <T extends Row>({
  columns = [],
  rows = [],
  sort,
  setSort,
  rowKeyProp,
  translateHeader = true,
  ...props
}: ListTableProps<T>) => {
  const { t } = useTranslations();

  return (
    <TableWrapper>
      <StyledTable {...props}>
        <TableHead>
          <TableRow>
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
          {rows.map((rowProps) => {
            return (
              <TableRow key={rowProps?.[rowKeyProp] as Key}>
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
    </TableWrapper>
  );
};

export default ListTable;
