import { FullClientSpinner } from '@/app/components/client-spinner';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';

export const SpinnerModal = createModal<{ title: string }>(({ title }) => {
  const { open, TransitionProps } = useOphModalProps();
  return (
    <OphModalDialog
      open={open}
      TransitionProps={TransitionProps}
      title={title}
      maxWidth="md"
      titleAlign="center"
    >
      <FullClientSpinner />
    </OphModalDialog>
  );
});
