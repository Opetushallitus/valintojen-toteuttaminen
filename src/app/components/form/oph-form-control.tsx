'use client';
import {
  FormControl,
  FormControlProps,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import { useId } from 'react';
import { EMPTY_ARRAY } from '@/app/lib/common';
import { styled } from '@/app/theme';

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  margin: theme.spacing(0.5, 0),
}));

export const OphFormControl = ({
  label,
  renderInput,
  helperText,
  errorMessages = EMPTY_ARRAY,
  ...props
}: Omit<FormControlProps, 'children'> & {
  label?: string;
  helperText?: string;
  errorMessages?: Array<string>;
  renderInput: (props: { labelId: string }) => React.ReactNode;
}) => {
  const id = useId();
  const labelId = `OphFormControl-${id}-label`;
  return (
    <FormControl {...props}>
      {label && <FormLabel id={labelId}>{label}</FormLabel>}
      {helperText && (
        <StyledFormHelperText error={false}>{helperText}</StyledFormHelperText>
      )}
      {renderInput({ labelId })}
      {errorMessages.map((message, index) => (
        <StyledFormHelperText error={true} key={`${index}_${message}`}>
          {message}
        </StyledFormHelperText>
      ))}
    </FormControl>
  );
};
