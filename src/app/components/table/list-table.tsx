'use client';

import {
  Button,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import { Haku, getAlkamisKausi, Tila } from '@/app/lib/kouta-types';
import { colors } from '@/app/theme';
import { ExpandLess, ExpandMore, UnfoldMore } from '@mui/icons-material';
import { getSortParts } from './table-utils';
import { TranslatedName } from '@/app/lib/localization/localization-types';
import { useTranslations } from '@/app/hooks/useTranslations';
import { TFunction } from 'i18next';
import { ExternalLink } from '../external-link';
import React, { Key } from 'react';

type Column<P> = {
  title?: string;
  key: string;
  render: (props: P) => React.ReactNode;
  style?: React.CSSProperties;
};

type Entity = { oid: string; nimi?: TranslatedName | string; tila?: Tila };

type KeysMatching<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O & string];

export const makeHakuColumn = <T extends Entity = Entity>(
  translateEntity: (entity: TranslatedName) => string,
): Column<T> => ({
  title: 'yleinen.nimi',
  key: 'nimi',
  render: (haku) => (
    <MuiLink href={`/haku/${haku.oid}`} sx={{ textDecoration: 'none' }}>
      {typeof haku.nimi == 'object' ? translateEntity(haku.nimi) : haku.nimi}
    </MuiLink>
  ),
  style: {
    width: 'auto',
  },
});

export const makeNameColumn = <T extends Entity = Entity>(
  translateEntity: (entity: TranslatedName) => string,
): Column<T> => ({
  title: 'Nimi',
  key: 'nimi',
  render: (t) => (
    <span>{typeof t.nimi === 'object' ? translateEntity(t.nimi) : t.nimi}</span>
  ),
  style: {
    width: 'auto',
  },
});

export const makeGenericColumn = <T extends Record<string, unknown>>({
  title,
  key,
  valueProp,
}: {
  title: string;
  key: string;
  valueProp: KeysMatching<T, string | number | undefined>;
}): Column<T> => ({
  title,
  key,
  render: (props) => <span>{props[valueProp] as string}</span>,
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
}): Column<T> => ({
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
}): Column<T> => ({
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
}): Column<T> => ({
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

export const makeTilaColumn = <T extends Entity = Entity>(): Column<T> => ({
  title: 'yleinen.tila',
  key: 'tila',
  render: (haku) => <span>{haku.tila}</span>,
  style: {
    width: 0,
  },
});

export const makeHakutapaColumn = (
  getMatchingHakutapa: (koodiUri: string) => string | undefined,
): Column<Haku> => ({
  title: 'haku.hakutapa',
  key: 'hakutapaNimi',
  render: (haku) => <span>{getMatchingHakutapa(haku.hakutapaKoodiUri)}</span>,
});

export const makeKoulutuksenAlkamiskausiColumn = (
  t: TFunction,
): Column<Haku> => ({
  title: 'haku.alkamiskausi',
  key: 'alkamiskausiNimi',
  render: (haku) => (
    <span>
      {haku.alkamisKausiKoodiUri
        ? `${haku.alkamisVuosi} ${t(getAlkamisKausi(haku.alkamisKausiKoodiUri))}`
        : ''}
    </span>
  ),
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
  columns?: Array<Column<T>>;
  rows?: Array<T>;
  sort?: string;
  setSort?: (sort: string) => void;
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
}: {
  colId: string;
  title?: string;
  style?: React.CSSProperties;
  sort?: string;
  setSort?: (sort: string) => void;
}) => {
  const { direction } = getSortParts(sort, colId);

  return (
    <StyledCell sx={style} sortDirection={direction}>
      {setSort && (
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
      )}
      {!setSort && <span style={{ fontWeight: 600 }}>{title}</span>}
    </StyledCell>
  );
};

export type Row<K extends string = string> = Record<K, unknown>;

export const ListTable = <T extends Row>({
  columns = [],
  rows = [],
  sort,
  setSort,
  rowKeyProp,
  ...props
}: ListTableProps<T>) => {
  const { t } = useTranslations();

  return (
    <StyledTable {...props}>
      <TableHead>
        <TableRow>
          {columns.map((columnProps) => {
            const { key, title, style } = columnProps;
            return (
              <HeaderCell
                key={key}
                colId={key}
                title={t(title ?? '')}
                style={style}
                sort={sort}
                setSort={setSort}
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
                  <StyledCell key={columnKey} sx={style}>
                    {render({ ...rowProps })}
                  </StyledCell>
                );
              })}
            </TableRow>
          );
        })}
      </StyledTableBody>
    </StyledTable>
  );
};

export default ListTable;
