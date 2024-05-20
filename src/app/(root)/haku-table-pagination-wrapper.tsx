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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return totalCount === 0 ? (
    <p>{t('common.noresults')}</p>
  ) : (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography sx={{ textAlign: 'left' }}>
          {t('haku.amount')} {totalCount}
        </Typography>
        <FormControl>
          <FormLabel id="page-size-select-label">
            {t('common.perpage')}
          </FormLabel>
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
