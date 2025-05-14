'use client';

import { Configuration } from '@/lib/configuration/server-configuration';

export type RouteConfigurationSection = Record<
  string,
  (params: Record<string, string | boolean | number>) => string
>;

export type ClientConfiguration = {
  domain: string;
  routes: {
    yleiset: RouteConfigurationSection;
    koodisto: RouteConfigurationSection;
    koutaInternal: RouteConfigurationSection;
    valintaperusteetService: RouteConfigurationSection;
    ataru: RouteConfigurationSection;
    valintalaskentaLaskentaService: RouteConfigurationSection;
    valintalaskentakoostepalvelu: RouteConfigurationSection;
    valintaTulosService: RouteConfigurationSection;
    sijoittelu: RouteConfigurationSection;
    // valintalaskenta-ui (vanha käyttöliittymä)
    // TODO: Poista kun korvattu uudella käyttöliittymällä
    valintalaskentahistoriaLinkUrl: (
      params: Record<string, string | boolean | number>,
    ) => string;
    hakukohderyhmapalvelu: RouteConfigurationSection;
  };
};

declare global {
  interface Window {
    configuration: ClientConfiguration;
  }
}

function constructRoute(
  routeString: string,
  params: Record<string, string | boolean | number>,
): string {
  let route = routeString;
  Object.entries(params).forEach(
    (entry: [string, string | number | boolean]) => {
      const value = '' + entry[1];
      route = route.replace(`{${entry[0]}}`, value);
    },
  );
  return route;
}

export function convertConfiguration(
  configuration: Configuration,
): ClientConfiguration {
  const convertSection = (section: Record<string, string>) => {
    const adjustedSection = new Map<
      string,
      (params: Record<string, string | boolean | number>) => string
    >();
    Object.entries(section).map((entry: [string, string]) => {
      const constructFn = (params: Record<string, string | boolean | number>) =>
        constructRoute(entry[1], params);
      adjustedSection.set(entry[0], constructFn);
    });
    return Object.fromEntries(adjustedSection);
  };
  return {
    domain: configuration.domain,
    routes: {
      yleiset: convertSection(configuration.yleiset),
      koodisto: convertSection(configuration.koodisto),
      koutaInternal: convertSection(configuration.koutaInternal),
      valintaperusteetService: convertSection(
        configuration.valintaperusteetService,
      ),
      ataru: convertSection(configuration.ataru),
      valintalaskentaLaskentaService: convertSection(
        configuration.valintalaskentaLaskentaService,
      ),
      valintalaskentakoostepalvelu: convertSection(
        configuration.valintalaskentakoostepalvelu,
      ),
      valintaTulosService: convertSection(configuration.valintaTulosService),
      sijoittelu: convertSection(configuration.sijoittelu),
      valintalaskentahistoriaLinkUrl: (
        params: Record<string, string | boolean | number>,
      ) => constructRoute(configuration.valintalaskentahistoriaLinkUrl, params),
      hakukohderyhmapalvelu: convertSection(
        configuration.hakukohderyhmapalvelu,
      ),
    },
  };
}

export function setConfiguration(configuration: ClientConfiguration) {
  window.configuration = configuration;
}

export function getConfiguration(): ClientConfiguration {
  return window.configuration;
}
