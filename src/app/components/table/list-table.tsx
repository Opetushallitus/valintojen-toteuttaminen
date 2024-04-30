'use client';

import {
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import { TranslatedName, getTranslation } from '@/app/lib/common';
import { Haku, getAlkamisKausi, Tila } from '@/app/lib/kouta-types';

type Column<P> = {
  title?: string;
  key: string;
  render: (props: P) => React.ReactNode;
  style?: Record<string, string | number>;
};

type Entity = { oid: string; nimi: TranslatedName; tila: Tila };

type KeysMatching<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O & string];

export const makeHakuColumn = <T extends Entity = Entity>(): Column<T> => ({
  title: 'Nimi',
  key: 'hakuNimi',
  render: (haku) => (
    <MuiLink href={`/haku/${haku.oid}`} sx={{ textDecoration: 'none' }}>
      {getTranslation(haku.nimi)}
    </MuiLink>
  ),
  style: {
    width: 'auto',
  },
});

export const makeCountColumn = ({
  title,
  key,
  amountProp,
}: {
  title: string;
  key: string;
  amountProp: KeysMatching<Haku, number>;
}): Column<Haku> => ({
  title,
  key,
  render: (props) => <span>{props[amountProp] ?? 0}</span>,
  style: { width: 0 },
});

export const makeTilaColumn = <T extends Entity = Entity>(): Column<T> => ({
  title: 'Tila',
  key: 'tila',
  render: (haku) => <span>{Tila[haku.tila]}</span>,
  style: {
    width: 0,
  },
});

export const makeHakutapaColumn = (
  getMatchingHakutapa: (koodiUri: string) => string | undefined,
): Column<Haku> => ({
  title: 'Hakutapa',
  key: 'hakutapa',
  render: (haku) => <span>{getMatchingHakutapa(haku.hakutapaKoodiUri)}</span>,
});

export const makeKoulutuksenAlkamiskausiColumn = (): Column<Haku> => ({
  title: 'Koulutuksen alkamiskausi',
  key: 'koulutuksenAlkamiskausi',
  render: (haku) => (
    <span>
      {haku.alkamisKausiKoodiUri
        ? `${haku.alkamisVuosi} ${getAlkamisKausi(haku.alkamisKausiKoodiUri)}`
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
});

const StyledRow = styled(TableRow)({
  borderSpacing: '0px',
  '&:nth-of-type(even)': {
    backgroundColor: '#f5f5f5',
  },
  '&:hover': {
    backgroundColor: '#e5f5ff',
  },
});

interface ListTableProps<T> extends React.ComponentProps<typeof StyledTable> {
  columns?: Array<Column<T>>;
  rows?: Array<T>;
}

export const ListTable = <T extends Entity>({
  columns = [],
  rows = [],
  ...props
}: ListTableProps<T>) => {
  return (
    <StyledTable {...props}>
      <TableHead>
        <StyledRow>
          {columns.map((columnProps) => {
            const { key, title, style } = columnProps;
            return (
              <StyledCell key={key} style={style}>
                {title}
              </StyledCell>
            );
          })}
        </StyledRow>
      </TableHead>
      <TableBody>
        {rows.map((rowProps) => {
          const { oid } = rowProps;

          return (
            <StyledRow key={oid}>
              {columns.map(({ key: columnKey, render, style }) => {
                return (
                  <StyledCell key={columnKey} style={style}>
                    {render({ ...rowProps })}
                  </StyledCell>
                );
              })}
            </StyledRow>
          );
        })}
      </TableBody>
    </StyledTable>
  );
};

export default ListTable;
