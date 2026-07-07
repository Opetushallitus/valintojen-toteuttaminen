import { buildConfiguration } from './build-configuration';

export const isDev = import.meta.env.DEV;

export const isProd = import.meta.env.PROD;

export const isTesting =
  import.meta.env.VITE_TEST === 'true' || import.meta.env.MODE === 'test';

export const localTranslations =
  import.meta.env.VITE_LOCAL_TRANSLATIONS === 'true';

export const xstateInspect = import.meta.env.VITE_XSTATE_INSPECT === 'true';

export type Configuration = ReturnType<typeof buildConfiguration>;
