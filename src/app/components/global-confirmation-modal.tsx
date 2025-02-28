import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { ConfirmationModalDialog } from '@/app/haku/[oid]/henkilo/[hakemusOid]/components/confirmation-modal-dialog';

export const GlobalConfirmationModal = createModal<{
  onConfirm: () => void;
  onCancel?: () => void;
  text?: React.ReactNode;
  title: string;
  maxWidth?: 'sm' | 'md' | false;
}>(({ title, text, onConfirm, onCancel, maxWidth }) => {
  const { open, onClose } = useOphModalProps();

  return (
    <ConfirmationModalDialog
      title={title}
      open={open}
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
      onCancel={() => {
        onCancel?.();
        onClose();
      }}
      maxWidth={maxWidth}
    >
      {text}
    </ConfirmationModalDialog>
  );
});
