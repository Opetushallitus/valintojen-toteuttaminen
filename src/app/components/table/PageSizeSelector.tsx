'use client';
import React from 'react';
import { FormControl, Select, MenuItem, FormLabel } from '@mui/material';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/app/lib/constants';
import { useTranslations } from '@/app/hooks/useTranslations';

export const PageSizeSelector = ({
  pageSize,
  setPageSize,
}: {
  pageSize: number;
  setPageSize: (page: number) => void;
}) => {
  const { t } = useTranslations();
  return (
    <FormControl>
      <FormLabel id="page-size-select-label">{t('yleinen.persivu')}</FormLabel>
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
  );
};
