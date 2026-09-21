import { createBrowserInspector } from '@statelyai/inspect';
import { environmentManager } from '@tanstack/react-query';
import { isTesting, xstateInspect } from './configuration/configuration';

export const inspect =
  xstateInspect && !environmentManager.isServer() && !isTesting
    ? (createBrowserInspector()?.inspect ?? undefined)
    : undefined;
