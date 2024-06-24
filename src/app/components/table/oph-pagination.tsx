'use client';
import React from 'react';
import { styled } from '@/app/theme';
import {
  Button,
  Pagination,
  PaginationItem,
  PaginationProps,
  PaginationRenderItemParams,
} from '@mui/material';
import { colors } from '@opetushallitus/oph-design-system';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const StyledPaginationItem = styled(PaginationItem)(({ theme }) => ({
  ...theme.typography.label,
  color: theme.palette.primary.main,
  '&.Mui-disabled': {
    color: colors.grey400,
    opacity: 1,
  },
  '&.MuiPaginationItem-page, &.MuiPaginationItem-previousNext': {
    '&:hover:not(.Mui-selected)': {
      backgroundColor: 'inherit',
      boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
      color: theme.palette.primary.light,
    },
  },
  '&.MuiPaginationItem-previousNext': {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '.MuiButton-icon': {
      margin: 0,
    },
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: colors.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
})) as typeof PaginationItem;

type OphPaginationProps = Pick<PaginationProps, 'aria-label'> & {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  setPageNumber: (page: number) => void;
  previousText: string;
  nextText: string;
};

export const OphPagination = ({
  totalCount,
  pageSize,
  pageNumber,
  setPageNumber,
  previousText,
  nextText,
}: OphPaginationProps) => {
  return (
    <Pagination
      count={Math.ceil(totalCount / pageSize)}
      page={pageNumber}
      onChange={(_e: unknown, value: number) => {
        setPageNumber(value);
      }}
      renderItem={(item: PaginationRenderItemParams) => (
        <StyledPaginationItem
          component={Button}
          startIcon={
            item.type === 'previous' && (
              <ChevronLeft sx={{ marginLeft: '-7px' }} />
            )
          }
          endIcon={
            item.type === 'next' && (
              <ChevronRight sx={{ marginRight: '-7px' }} />
            )
          }
          slots={{
            previous: () => previousText,
            next: () => nextText,
          }}
          {...item}
        />
      )}
    />
  );
};
