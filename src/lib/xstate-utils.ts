import { createBrowserInspector } from '@statelyai/inspect';
import { isServer } from '@tanstack/react-query';
import { xstateInspect } from './configuration';

export const inspect =
  xstateInspect && isServer
    ? undefined
    : (createBrowserInspector()?.inspect ?? undefined);
