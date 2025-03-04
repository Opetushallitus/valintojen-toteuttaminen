'use client';

import { useSelector } from '@xstate/react';
import { useCallback } from 'react';
import {
  assign,
  createActor,
  setup,
  fromCallback,
  AnyEventObject,
  CallbackActorLogic,
  sendTo,
} from 'xstate';

const DEFAULT_TOAST_DURATION = 6000;

enum ToastEvents {
  REMOVE = 'REMOVE_TOAST',
  ADD = 'ADD_TOAST',
  ENTER = 'TOAST_ENTER',
  LEAVE = 'TOAST_LEAVE',
}

const setToastTimer = (
  key: string,
  duration: number,
  sendBack: (event: AnyEventObject) => void,
) => setTimeout(() => sendBack({ type: ToastEvents.REMOVE, key }), duration);

export type Toast = {
  key: string;
  message: string;
  type: 'error' | 'success' | 'confirm';
  messageParams?: Record<string, string | number>;
  ref?: CallbackActorLogic<AnyEventObject>;
  confirmFn?: () => void;
};

const toasterMachine = setup({
  types: {
    context: {
      toasts: [] as Array<Toast>,
    },
  },
  actions: {
    addToast: assign({
      toasts: ({ context, spawn, event }) => {
        const key = event.toast.key;
        return [
          ...context.toasts.filter((t) => t.key !== key),
          {
            ...event.toast,
            ref: spawn(
              fromCallback(({ sendBack, receive }) => {
                if (event.toast.type === 'confirm') {
                  return;
                }
                let id = setToastTimer(key, DEFAULT_TOAST_DURATION, sendBack);

                receive(({ type }) => {
                  if (type === ToastEvents.ENTER) {
                    clearTimeout(id);
                  } else if (type === ToastEvents.LEAVE) {
                    id = setToastTimer(key, DEFAULT_TOAST_DURATION, sendBack);
                  }
                });

                return () => {
                  clearTimeout(id);
                };
              }),
              { id: key },
            ),
          },
        ];
      },
    }),
    removeToast: assign({
      toasts: ({ context, event }) => {
        return context.toasts.filter((toast) => toast.key != event.key);
      },
    }),
  },
}).createMachine({
  id: 'toasterMachine',
  initial: 'empty',
  context: {
    toasts: [],
  },
  states: {
    empty: {},
    showing: {
      on: {
        always: {
          guard: ({ context }) => context.toasts.length < 1,
          target: 'empty',
        },
        [ToastEvents.REMOVE]: {
          actions: 'removeToast',
          reenter: true,
        },
        [ToastEvents.ENTER]: {
          actions: sendTo(({ event }) => event.key, {
            type: ToastEvents.ENTER,
          }),
        },
        [ToastEvents.LEAVE]: {
          actions: sendTo(({ event }) => event.key, {
            type: ToastEvents.LEAVE,
          }),
        },
      },
    },
  },
  on: {
    [ToastEvents.ADD]: {
      target: '.showing',
      actions: 'addToast',
    },
  },
});

const toasterActor = createActor(toasterMachine).start();

export const useToaster = () => {
  const toasts = useSelector(toasterActor, ({ context }) => context.toasts);

  const addToast = useCallback(
    (toast: Toast) =>
      toasterActor.send({ type: ToastEvents.ADD, toast: toast }),
    [],
  );
  const removeToast = useCallback(
    (key: string) => toasterActor.send({ type: ToastEvents.REMOVE, key }),
    [],
  );

  const toastEnter = useCallback(
    (key: string) => toasterActor.send({ type: ToastEvents.ENTER, key }),
    [],
  );
  const toastLeave = useCallback(
    (key: string) => toasterActor.send({ type: ToastEvents.LEAVE, key }),
    [],
  );
  return {
    toasts,
    addToast,
    removeToast,
    toastEnter,
    toastLeave,
  };
};

export default useToaster;
