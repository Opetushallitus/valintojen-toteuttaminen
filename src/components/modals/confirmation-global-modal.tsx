import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import {
  ConfirmationModal,
  ConfirmationModalProps,
} from '@/components/modals/confirmation-modal';

export const ConfirmationGlobalModal = createModal<
  Omit<ConfirmationModalProps, 'children'> & { content?: React.ReactNode }
>(({ content, onConfirm, onCancel, ...rest }) => {
  const { open, onClose } = useOphModalProps();

  return (
    <ConfirmationModal
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
    </ConfirmationModal>
  );
});
