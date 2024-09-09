'use client';
import React, { useState } from 'react';
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

type ValidatorParams = {
  val: string;
  existingError: string | undefined;
  setError: (msg: string | undefined) => void;
};

export const OphInput = ({
  id,
  value,
  validators,
  onChange,
  ...props
}: InputProps & {
  id: string;
  value: string;
  validators: [(v: ValidatorParams) => boolean];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const validateOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
    validators.every((validator) =>
      validator({
        val: event.currentTarget.value,
        existingError: error,
        setError,
      }),
    );
  };
  return (
    <FormControl>
      <OutlinedInput
        id={id}
        value={value}
        size="small"
        onChange={validateOnChange}
        error={!!error && error.length > 0}
        {...props}
      ></OutlinedInput>
      {!!error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export const numberValidator = ({
  min,
  max,
}: {
  min?: number | string;
  max?: number | string;
}): ((v: ValidatorParams) => boolean) => {
  const maxVal =
    max && typeof max != 'number'
      ? Number.parseFloat(max)
      : !!max && (max as number);
  const minVal =
    min && typeof min != 'number'
      ? Number.parseFloat(min)
      : !!min && (min as number);
  return (v: ValidatorParams) => {
    const result =
      !Number.isNaN(v.val) &&
      (!minVal || minVal <= Number.parseFloat(v.val)) &&
      (!maxVal || maxVal >= Number.parseFloat(v.val));
    if (!result) {
      //TODO translate
      if (min && max) {
        v.setError(`Syötä numero väliltä ${min}-${max}`);
      } else if (min) {
        v.setError(`Syötä numero yhtä suuri tai isompi kuin ${min}`);
      } else if (max) {
        v.setError(`Syötä numero yhtä suuri tai pienempi kuin ${max}`);
      } else {
        v.setError('Syötä numero');
      }
    } else if (v.existingError) {
      v.setError(undefined);
    }
    return result;
  };
};
