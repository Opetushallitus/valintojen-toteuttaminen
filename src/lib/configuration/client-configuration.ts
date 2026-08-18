import { Configuration } from '@/lib/configuration/configuration';

declare global {
  interface Window {
    configuration: Configuration;
  }
}

export function setConfiguration(configuration: Configuration) {
  window.configuration = configuration;
}

export function getConfiguration(): Configuration {
  // Palautetaan turvallisesti undefined selaimen ulkopuolella (mm. SPA-buildin
  // prerender ajaa koodin Nodessa, jolloin window puuttuu).
  return typeof window === 'undefined'
    ? (undefined as unknown as Configuration)
    : window.configuration;
}
