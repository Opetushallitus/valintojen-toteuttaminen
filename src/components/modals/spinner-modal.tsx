import { FullClientSpinner } from '../client-spinner';
import { OphModalProps, OphModal } from './oph-modal';

export const SpinnerModal = (props: OphModalProps) => {
  return (
    <OphModal maxWidth="md" titleAlign="center" {...props}>
      <FullClientSpinner />
    </OphModal>
  );
};
