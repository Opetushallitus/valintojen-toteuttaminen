'use client';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

export const GlobalModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <NiceModal.Provider>{children}</NiceModal.Provider>;
};

export const useOphModalProps = () => {
  const modal = useModal();
  return {
    open: modal.visible,
    onClose: () => modal.hide(), // omit if you don't want yout modal to be closable
    TransitionProps: {
      onExited: () => {
        modal.resolveHide();
        if (!modal.keepMounted) {
          modal.remove();
        }
      },
    },
  };
};

export {
  show as showModal,
  hide as hideModal,
  create as createModal,
  useModal,
} from '@ebay/nice-modal-react';
