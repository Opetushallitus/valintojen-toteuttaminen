import { buildConfiguration } from './server-configuration';

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const isTesting = Boolean(process.env.TEST);

export const localTranslations = process.env.LOCAL_TRANSLATIONS === 'true';

export const xstateInspect = process.env.XSTATE_INSPECT === 'true';

export type Configuration = Awaited<ReturnType<typeof buildConfiguration>>;
