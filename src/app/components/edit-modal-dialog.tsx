import { FullClientSpinner } from '@/app/components/client-spinner';
import {
  OphModalDialog,
  OphModalDialogProps,
} from '@/app/components/oph-modal-dialog';
import { withDefaultProps } from '@/app/lib/mui-utils';
import { Box, FormLabel } from '@mui/material';
import { useId } from 'react';
import { styled } from '@/app/lib/theme';

const ModalWithDefaultProps = withDefaultProps(OphModalDialog, {
  maxWidth: 'lg',
  titleAlign: 'left',
});

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

export const EditModalDialog = ({
  pendingTitle,
  children,
  slotProps,
  isPending,
  onClose,
  ...props
}: OphModalDialogProps & {
  pendingTitle: string;
  isPending: boolean;
}) => {
  return isPending ? (
    <ModalWithDefaultProps
      open={true}
      title={pendingTitle}
      slotProps={slotProps}
    >
      <FullClientSpinner />
    </ModalWithDefaultProps>
  ) : (
    <ModalWithDefaultProps slotProps={slotProps} onClose={onClose} {...props}>
      <Box
        sx={{
          display: 'grid',
          paddingY: 2,
          gridGap: (theme) => theme.spacing(2),
          gridTemplateColumns: '170px 1fr',
          placeItems: 'start stretch',
        }}
      >
        {children}
      </Box>
    </ModalWithDefaultProps>
  );
};
