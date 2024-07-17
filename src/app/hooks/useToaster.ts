'use client';

import { useSelector } from '@xstate/react';
import { useMemo } from 'react';
import {
  assign,
  createActor,
  setup,
  fromCallback,
  AnyEventObject,
  CallbackActorLogic,
} from 'xstate';

const DEFAULT_TOAST_DURATION = 15000;

const CLOSE_TOAST = 'CLOSE_TOAST';
const OPEN_TOAST = 'OPEN_TOAST';

const setToastTimer = (
  key: string,
  duration: number,
  sendBack: (event: AnyEventObject) => void,
) => setTimeout(() => sendBack({ type: CLOSE_TOAST, key }), duration);

export type Toast = {
  key: string;
  message: string;
  type: 'error' | 'success';
  messageParams?: Record<string, string | number>;
  ref?: CallbackActorLogic<AnyEventObject>;
};

const toasterMachine = setup({
  types: {
    context: {
      toasts: [] as Toast[],
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
              fromCallback(({ sendBack }) => {
                const id = setToastTimer(key, DEFAULT_TOAST_DURATION, sendBack);

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
        [CLOSE_TOAST]: {
          target: 'showing',
          actions: 'removeToast',
        },
      },
    },
  },
  on: {
    [OPEN_TOAST]: {
      target: '.showing',
      actions: 'addToast',
    },
  },
});

const toasterActor = createActor(toasterMachine).start();

export const useToaster = () => {
  const toasts = useSelector(toasterActor, ({ context }) => context.toasts);

  const addToast = useMemo(
    () => (toast: Toast) =>
      toasterActor.send({ type: OPEN_TOAST, toast: toast }),
    [],
  );
  const removeToast = (key: string) =>
    toasterActor.send({ type: CLOSE_TOAST, key });
  return {
    toasts,
    addToast,
    removeToast,
  };
};

export default useToaster;
