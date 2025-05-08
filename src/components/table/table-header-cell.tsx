import { ExpandLess, ExpandMore, UnfoldMore } from '@mui/icons-material';
import { getSortParts } from './table-utils';
import { ophColors } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import { Button, TableCell } from '@mui/material';
import { memo } from 'react';

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

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0, 0, 0, 2),
  '&:last-child': {
    paddingRight: theme.spacing(2),
  },
  textAlign: 'left',
  'button:focus': {
    color: ophColors.blue2,
  },
}));

export const TableHeaderCell = memo(function TableHeaderCell({
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
  setSort?: (sortDef: string) => void;
  sortable?: boolean;
}) {
  const { direction } = getSortParts(sort, colId);

  return (
    <StyledHeaderCell sx={style} sortDirection={direction}>
      {setSort && sortable ? (
        <Button
          sx={{
            color: ophColors.black,
            border: 0,
            padding: 0,
            margin: (theme) => theme.spacing(1, 0),
            lineHeight: 1.3,
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
});
