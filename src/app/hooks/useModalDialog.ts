'use client';

import { useSelector } from '@xstate/react';
import { assign, createActor, setup } from 'xstate';
import { OphModalDialogProps } from '../components/oph-modal-dialog';

enum ModalEvents {
  SHOW = 'SHOW_MODAL',
  HIDE = 'HIDE_MODAL',
}

export type ModalContext = Omit<OphModalDialogProps, 'open'>;

const emptyContext: ModalContext = {
  title: '',
  children: null,
  onClose: undefined,
  actions: null,
  titleAlign: undefined,
  contentAlign: undefined,
} as const;

const modalMachine = setup({
  types: {
    context: {} as ModalContext,
    events: {} as
      | { type: ModalEvents.SHOW; modal: ModalContext }
      | { type: ModalEvents.HIDE },
  },
}).createMachine({
  id: 'modalMachine',
  initial: 'hidden',
  context: emptyContext,
  states: {
    preVisible: {
      always: 'visible',
    },
    visible: {
      on: {
        [ModalEvents.SHOW]: {
          target: 'preVisible',
          actions: assign(({ event }) => {
            return {
              ...emptyContext,
              ...event.modal,
            };
          }),
        },
        [ModalEvents.HIDE]: {
          target: 'hidden',
        },
      },
    },
    preHidden: {
      after: {
        100: {
          target: 'hidden',
        },
      },
    },
    hidden: {
      entry: assign(() => emptyContext),
      on: {
        [ModalEvents.SHOW]: {
          target: 'preVisible',
          actions: assign(({ event }) => {
            return {
              ...emptyContext,
              ...event.modal,
            };
          }),
        },
      },
    },
  },
  on: {},
});

const modalActor = createActor(modalMachine).start();

export const useModalDialog = () => {
  const context = useSelector(modalActor, ({ context }) => context);
  const value = useSelector(modalActor, (state) => state.value);

  return {
    isOpen: value === 'visible',
    context,
    showModal: (ctx: ModalContext) => {
      modalActor.send({ type: ModalEvents.SHOW, modal: ctx });
    },
    hideModal: () => {
      modalActor.send({ type: ModalEvents.HIDE });
    },
  };
};

export default useModalDialog;
