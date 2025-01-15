import { useMachine } from '@xstate/react';

import { createBrowserInspector } from '@statelyai/inspect';
import { isServer } from '@tanstack/react-query';
import { xstateInspect } from './configuration';

type UseMachineParams = Parameters<typeof useMachine>;

export const inspect =
  xstateInspect && isServer
    ? undefined
    : (createBrowserInspector()?.inspect ?? undefined);

export const useXstateMachine = (
  machine: UseMachineParams[0],
  options: UseMachineParams[1] = {},
) => {
  return useMachine(machine, { inspect, ...options });
};
