'use client';
import React from 'react';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/app/lib/constants';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphFormControl } from '@/app/components/oph-form-control';
import { OphSelect } from '@/app/components/oph-select';

const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((size) => ({
  value: size.toString(),
  label: size.toString(),
}));

export const PageSizeSelector = ({
  pageSize,
  setPageSize,
}: {
  pageSize: number;
  setPageSize: (page: number) => void;
}) => {
  const { t } = useTranslations();
  return (
    <OphFormControl
      id="page-size-select"
      label={t('yleinen.persivu')}
      renderInput={({ labelId }) => (
        <OphSelect
          labelId={labelId}
          value={pageSize.toString()}
          onChange={(e) => {
            const newValue = parseInt(e.target.value, 10);
            setPageSize(isNaN(newValue) ? DEFAULT_PAGE_SIZE : newValue);
          }}
          options={PAGE_SIZE_OPTIONS}
        />
      )}
    />
  );
};
