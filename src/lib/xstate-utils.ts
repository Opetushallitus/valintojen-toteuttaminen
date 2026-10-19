import { environmentManager } from '@tanstack/react-query';
import { isTesting } from './configuration/configuration';

export const inspect =
  import.meta.env.VITE_XSTATE_INSPECT === 'true' &&
  !environmentManager.isServer() &&
  !isTesting
    ? (await import('@statelyai/inspect')).createBrowserInspector()?.inspect
    : undefined;
