'use client';
import React from 'react';
import { OutlinedInput, InputProps, styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';

const WhiteInput = styled(OutlinedInput)(() => ({
  backgroundColor: ophColors.white,
}));

export const OphInput = ({
  value,
  onChange,
  ...props
}: InputProps & {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string[];
}) => {
  return (
    <WhiteInput value={value} size="small" onChange={onChange} {...props} />
  );
};
