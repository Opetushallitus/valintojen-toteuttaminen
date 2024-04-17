'use client';

import { Link as MuiLink, Table, TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { getTranslation } from '@/app/lib/common';
import { Haku, getAlkamisKausi, Tila } from '@/app/lib/kouta-types';

type Column = {
  title?: string;
  key: string;
  render: (obj: any) => React.ReactNode;
  style?: Record<string, string | number>;
};

export const makeHakuColumn = (
): Column => ({
  title: 'Nimi',
  key: 'hakuNimi',
  render: (haku: Haku) => <MuiLink href={`/haku/${haku.oid}`} sx={{textDecoration: 'none'}}>{getTranslation(haku.nimi)}</MuiLink>,
  style: {
    width: 'auto',
  },
});

export const makeCountColumn = ({title, key, amountProp}: {title: string, key: string, amountProp: string}): Column => ({
  title,
  key,
  render: (props: any) => <span>{props[amountProp] ?? 0}</span>,
  style: { width: 0 },
});

export const makeTilaColumn = (): Column => ({
  title: 'Tila',
  key: 'tila',
  render: (haku: Haku) => <span>{Tila[haku.tila]}</span>,
  style: {
    width: 0,
  },
});

export const makeHakutapaColumn = (getMatchingHakutapa: Function): Column => ({
  title: 'Hakutapa',
  key: 'hakutapa',
  render: (haku: Haku) => <span>{getMatchingHakutapa(haku.hakutapaKoodiUri)}</span>,
});

export const makeKoulutuksenAlkamiskausiColumn = (): Column => ({
  title: 'Koulutuksen alkamiskausi',
  key: 'koulutuksenAlkamiskausi',
  render: (haku: Haku) => <span>{haku.alkamisKausiKoodiUri ? `${haku.alkamisVuosi} ${getAlkamisKausi(haku.alkamisKausiKoodiUri)}` : ''}</span>,
});

type ListTableProps = {
  columns?: Array<Column>;
  rows?: Array<any>;
};

const StyledTable = styled(Table)(
  {
    width: '100%',
    borderSpacing: '0px'
  }
);

const StyledCell = styled(TableCell)(
  {
    borderSpacing: '0px',
    padding: '1rem',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  }
);

const StyledRow = styled(TableRow)(
  {
    borderSpacing: '0px',
    '&:nth-of-type(even)': {
      backgroundColor: '#f5f5f5'
    },
    '&:hover': {
      backgroundColor: '#e0f2fd'
    }
  }
);

export const ListTable = ({
  columns = [],
  rows = [],
  ...props
}: ListTableProps) => {

  return (
    <StyledTable {...props}>
      <TableHead>
        <StyledRow>
          {columns.map(columnProps => {
            const {
              key,
              title,
              style,
            } = columnProps;
            return (
              <StyledCell
                key={key}
                style={style}
              >
                {title}
              </StyledCell>
            );
          })}
        </StyledRow>
      </TableHead>
      <TableBody>
        {rows.map(rowProps => {
          const { oid } = rowProps;

          return (
            <StyledRow key={oid}>
              {columns.map(
                ({
                  key: columnKey,
                  render,
                  style,
                }) => {

                  return (
                    <StyledCell
                      key={columnKey}
                      style={style}
                    >
                      {render({ ...rowProps })}
                    </StyledCell>
                  );
                }
              )}
            </StyledRow>
          );
        })}
      </TableBody>
    </StyledTable>
  );
};

export default ListTable;