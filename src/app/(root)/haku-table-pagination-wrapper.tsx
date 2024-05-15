'use client';
import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  FormLabel,
  Typography,
  Box,
  styled,
  Pagination,
} from '@mui/material';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/app/lib/constants';

export const StyledPagination = styled(Pagination)({
  display: 'flex',
});

export type HakuTablePaginationWrapperProps = {
  totalCount: number;
  pageNumber: number;
  setPageNumber: (page: number) => void;
  pageSize: number;
  setPageSize: (page: number) => void;
  children: React.ReactNode;
};

export const HakuTablePaginationWrapper = ({
  totalCount,
  pageNumber,
  pageSize,
  setPageNumber,
  setPageSize,
  children,
}: HakuTablePaginationWrapperProps) => {
  return totalCount === 0 ? (
    <p>Ei hakutuloksia</p>
  ) : (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography sx={{ textAlign: 'left' }}>Hakuja: {totalCount}</Typography>
        <FormControl>
          <FormLabel id="page-size-select-label">Näytä per sivu:</FormLabel>
          <Select
            labelId="page-size-select-label"
            name="page-size-select"
            value={pageSize.toString()}
            onChange={(e) => {
              const newValue = parseInt(e.target.value, 10);
              setPageSize(isNaN(newValue) ? DEFAULT_PAGE_SIZE : newValue);
            }}
          >
            {PAGE_SIZES.map((size) => {
              return (
                <MenuItem value={size} key={size}>
                  {size}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" rowGap={1} alignItems="center">
        {children}
        <StyledPagination
          aria-label="Sivutus"
          count={Math.ceil(totalCount / pageSize)}
          page={pageNumber}
          onChange={(_e: unknown, value: number) => {
            setPageNumber(value);
          }}
        />
      </Box>
    </>
  );
};
