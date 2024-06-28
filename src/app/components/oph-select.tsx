'use client';
import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  FormLabel,
  SelectProps,
  FormControlProps,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

type OphSelectValue<T> = SelectProps<T>['value'];

type OphSelectOption<T> = { label: string; value: OphSelectValue<T> };

type PlainSelectProps<T> = Omit<SelectProps<T>, 'children'> & {
  options: Array<OphSelectOption<T>>;
  clearable?: boolean;
};

export type OphSelectProps<T> = Omit<PlainSelectProps<T>, 'labelId'> & {
  label?: string;
  formControlProps?: FormControlProps;
};

export const OphSelect = <T extends string | number>({
  options,
  clearable = false,
  ...props
}: PlainSelectProps<T>) => {
  const { t } = useTranslations();
  return (
    <Select {...props} displayEmpty={clearable}>
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

export const OphSelectControl = <T extends string>({
  id,
  label: selectLabel,
  formControlProps,
  ...props
}: OphSelectProps<T> & { id: string }) => {
  const labelId = `${id}-label`;
  return selectLabel ? (
    <FormControl {...formControlProps}>
      <FormLabel id={labelId}>{selectLabel}</FormLabel>
      <OphSelect {...props} id={id} labelId={labelId} />
    </FormControl>
  ) : (
    <OphSelect {...props} id={id} />
  );
};
