import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { SpinnerModal } from './spinner-modal';

export const SpinnerGlobalModal = createModal<{ title: string }>(
  ({ title }) => {
    const { open, slotProps } = useOphModalProps();
    return <SpinnerModal title={title} slotProps={slotProps} open={open} />;
  },
);
