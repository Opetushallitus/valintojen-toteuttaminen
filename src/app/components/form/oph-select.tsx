'use client';
import React from 'react';
import { Select, MenuItem, SelectProps } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

type OphSelectValue<T> = SelectProps<T>['value'];

type OphSelectOption<T> = { label: string; value: OphSelectValue<T> };

type OphSelectProps<T> = Omit<SelectProps<T>, 'children'> & {
  options: Array<OphSelectOption<T>>;
  clearable?: boolean;
};

export const OphSelect = <T extends string | number>({
  options,
  clearable = false,
  ...props
}: OphSelectProps<T>) => {
  const { t } = useTranslations();
  return (
    <Select
      {...props}
      inputProps={{ 'aria-label': t('yleinen.valitsevaihtoehto') }}
      displayEmpty={clearable}
    >
      {clearable && <MenuItem value="">{t('yleinen.valitse')}</MenuItem>}
      {options.map(({ value, label }) => {
        return (
          <MenuItem value={value} key={value}>
            {label}
          </MenuItem>
        );
      })}
    </Select>
  );
};
