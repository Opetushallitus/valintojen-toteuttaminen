'use client';
import React from 'react';
import { OutlinedInput, InputProps } from '@mui/material';

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
    <OutlinedInput value={value} size="small" onChange={onChange} {...props} />
  );
};