'use client';

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
  return window.configuration;
}
