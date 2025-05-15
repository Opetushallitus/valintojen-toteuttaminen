export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const isTesting = Boolean(process.env.TEST);

export const localTranslations = process.env.LOCAL_TRANSLATIONS === 'true';

export const xstateInspect = process.env.XSTATE_INSPECT === 'true';

export type Configuration = {
  domain: string;
  routes: {
    yleiset: Record<string, string>;
    koodisto: Record<string, string>;
    koutaInternal: Record<string, string>;
    valintaperusteetService: Record<string, string>;
    ataru: Record<string, string>;
    valintalaskentaLaskentaService: Record<string, string>;
    valintalaskentakoostepalvelu: Record<string, string>;
    valintaTulosService: Record<string, string>;
    sijoittelu: Record<string, string>;
    valintalaskentahistoriaLinkUrl: string;
    hakukohderyhmapalvelu: Record<string, string>;
  };
};
