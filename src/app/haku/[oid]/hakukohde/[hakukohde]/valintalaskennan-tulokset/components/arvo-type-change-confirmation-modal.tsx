import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { ConfirmationModalDialog } from '@/app/haku/[oid]/henkilo/[hakemusOid]/components/confirmation-modal-dialog';

export const ArvoTypeChangeConfirmationModal = createModal<{
  onConfirm: () => void;
  onCancel?: () => void;
  text?: string;
  title?: string;
}>(({ title, text, onConfirm, onCancel }) => {
  const { open, onClose } = useOphModalProps();

  return (
    <ConfirmationModalDialog
      title={title ? title : 'Vaihdetaanko järjestysperustetta?'}
      open={open}
      onAnswer={(answer) => {
        if (answer) {
          onConfirm();
          onClose();
        } else {
          onCancel?.();
          onClose();
        }
      }}
    >
      {text}
    </ConfirmationModalDialog>
  );
});
