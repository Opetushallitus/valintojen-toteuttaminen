import { FullClientSpinner } from '@/app/components/client-spinner';
import {
  OphModalDialog,
  OphModalDialogProps,
} from '@/app/components/oph-modal-dialog';
import { withDefaultProps } from '@/app/lib/mui-utils';
import { Box } from '@mui/material';

const ModalWithDefaultProps = withDefaultProps(OphModalDialog, {
  maxWidth: 'lg',
  titleAlign: 'left',
});

export const EditModalDialog = ({
  pendingTitle,
  children,
  TransitionProps,
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
      TransitionProps={TransitionProps}
    >
      <FullClientSpinner />
    </ModalWithDefaultProps>
  ) : (
    <ModalWithDefaultProps
      TransitionProps={TransitionProps}
      onClose={onClose}
      {...props}
    >
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
