import { ExpandLess, ExpandMore, UnfoldMore } from '@mui/icons-material';
import { getSortParts } from './table-utils';
import { ophColors } from '@opetushallitus/oph-design-system';
import { styled } from '@/app/lib/theme';
import { Button, TableCell } from '@mui/material';

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

const StyledHeaderCell = styled(TableCell)({
  padding: '0.2rem 0.1rem 0.2rem 0.4rem',
  textAlign: 'left',
  'button:focus': {
    color: ophColors.blue2,
  },
});

export const TableHeaderCell = ({
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
