import { createBrowserInspector } from '@statelyai/inspect';
import { isServer } from '@tanstack/react-query';
import { isTesting, xstateInspect } from './configuration/configuration';

export const inspect =
  xstateInspect && !isServer && !isTesting
    ? (createBrowserInspector()?.inspect ?? undefined)
    : undefined;
