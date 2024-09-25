'use client';
import useModalDialog from '../hooks/useModalDialog';
import { OphModalDialog } from './oph-modal-dialog';

export const GlobalModal = () => {
  const { isOpen, context } = useModalDialog();
  return <OphModalDialog open={isOpen} {...context} />;
};
