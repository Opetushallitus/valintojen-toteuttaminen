'use client';
import React from 'react';
import { Typography, Box, styled, Pagination } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { PageSizeSelector } from './PageSizeSelector';
import { OphPagination } from './OphPagination';

export const StyledPagination = styled(Pagination)({
  display: 'flex',
});

export type TablePaginationWrapperProps = {
  totalCount: number;
  pageNumber?: number;
  setPageNumber?: (page: number) => void;
  pageSize?: number;
  setPageSize?: (page: number) => void;
  children: React.ReactNode;
  countTranslationKey: string;
  countHidden?: boolean;
};

export const TablePaginationWrapper = ({
  totalCount,
  pageNumber,
  pageSize,
  setPageNumber,
  setPageSize,
  children,
  countTranslationKey,
  countHidden = false,
}: TablePaginationWrapperProps) => {
  const { t } = useTranslations();

  const hasPagination = totalCount && pageSize && pageNumber && setPageNumber;
  const hasPageSizeSelector = pageSize && setPageSize;

  return totalCount === 0 ? (
    <p>{t('yleinen.eiosumia')}</p>
  ) : (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {!countHidden && (
          <Typography sx={{ textAlign: 'left' }}>
            {t(countTranslationKey)} {totalCount}
          </Typography>
        )}
        {hasPageSizeSelector && (
          <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
        )}
      </Box>
      <Box display="flex" flexDirection="column" rowGap={1} alignItems="center">
        {children}
        {hasPagination && (
          <OphPagination
            totalCount={totalCount}
            pageSize={pageSize}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        )}
      </Box>
    </>
  );
};
