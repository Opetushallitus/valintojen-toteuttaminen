import { styled } from '@/app/lib/theme';
import { Box, FormLabel } from '@mui/material';
import { useId } from 'react';

export const PaddedLabel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
}));

export const InlineFormControl = ({
  label,
  renderInput,
}: {
  label: React.ReactNode;
  renderInput: (props: { labelId: string }) => React.ReactNode;
}) => {
  const id = useId();
  const labelId = `InlineFormControl-${id}-label`;
  return (
    <>
      <FormLabel id={labelId}>{label}</FormLabel>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {renderInput({ labelId })}
      </Box>
    </>
  );
};
