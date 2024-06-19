'use client';
import React from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { StyledPagination } from './table-pagination-wrapper';

export const OphPagination = ({
  totalCount,
  pageSize,
  pageNumber,
  setPageNumber,
}: {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  setPageNumber: (page: number) => void;
}) => {
  const { t } = useTranslations();
  return (
    <StyledPagination
      aria-label={t('yleinen.sivutus')}
      count={Math.ceil(totalCount / pageSize)}
      page={pageNumber}
      onChange={(_e: unknown, value: number) => {
        setPageNumber(value);
      }}
    />
  );
};
