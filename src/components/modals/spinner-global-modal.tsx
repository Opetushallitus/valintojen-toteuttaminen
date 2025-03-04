import { FullClientSpinner } from '@/components/client-spinner';
import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { OphModal } from '@/components/modals/oph-modal';

export const SpinnerGlobalModal = createModal<{ title: string }>(
  ({ title }) => {
    const { open, slotProps } = useOphModalProps();
    return (
      <OphModal
        slotProps={slotProps}
        open={open}
        title={title}
        maxWidth="md"
        titleAlign="center"
      >
        <FullClientSpinner />
      </OphModal>
    );
  },
);
