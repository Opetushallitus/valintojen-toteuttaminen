'use client';
import React from 'react';
import {
  Select,
  MenuItem,
  SelectProps,
  FormControl,
  OutlinedInput,
  FormHelperText,
  InputProps,
} from '@mui/material';
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

export const OphInput = ({
  id,
  value,
  onChange,
  helperText,
  ...props
}: InputProps & {
  id: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string[];
}) => {
  return (
    <FormControl>
      <OutlinedInput
        id={id}
        value={value}
        size="small"
        onChange={onChange}
        {...props}
      ></OutlinedInput>
      {!!helperText && helperText.length > 0 && (
        <FormHelperText>{helperText.join(' ')}</FormHelperText>
      )}
    </FormControl>
  );
};
