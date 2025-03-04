import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import {
  ConfirmationModalDialog,
  ConfirmationModalDialogProps,
} from '@/app/haku/[oid]/henkilo/[hakemusOid]/components/confirmation-modal-dialog';

export const GlobalConfirmationModal = createModal<
  Omit<ConfirmationModalDialogProps, 'children'> & { content?: React.ReactNode }
>(({ content, onConfirm, onCancel, ...rest }) => {
  const { open, onClose } = useOphModalProps();

  return (
    <ConfirmationModalDialog
      {...rest}
      open={open}
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
      onCancel={() => {
        onCancel?.();
        onClose();
      }}
    >
      {content}
    </ConfirmationModalDialog>
  );
});
