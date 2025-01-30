import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { ConfirmationModalDialog } from '@/app/haku/[oid]/henkilo/[hakemusOid]/components/confirmation-modal-dialog';

export const GlobalConfirmationModal = createModal<{
  onConfirm: () => void;
  onCancel?: () => void;
  text?: string;
  title: string;
}>(({ title, text, onConfirm, onCancel }) => {
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
    >
      {text}
    </ConfirmationModalDialog>
  );
});
