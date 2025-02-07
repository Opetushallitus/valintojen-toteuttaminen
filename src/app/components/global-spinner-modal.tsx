import { FullClientSpinner } from '@/app/components/client-spinner';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';

export const GlobalSpinnerModal = createModal<{ title: string }>(
  ({ title }) => {
    const { open, slotProps } = useOphModalProps();
    return (
      <OphModalDialog
        slotProps={slotProps}
        open={open}
        title={title}
        maxWidth="md"
        titleAlign="center"
      >
        <FullClientSpinner />
      </OphModalDialog>
    );
  },
);
