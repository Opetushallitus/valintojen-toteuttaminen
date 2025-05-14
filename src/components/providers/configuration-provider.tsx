'use client';
import {
  ClientConfiguration,
  convertConfiguration,
  setConfiguration,
} from '@/lib/configuration/client-configuration';
import { Configuration } from '@/lib/configuration/server-configuration';
import { createContext, useEffect, useState } from 'react';
import { isNullish } from 'remeda';

export const ConfigurationContext = createContext<{
  configuration: null | ClientConfiguration;
}>({ configuration: null });

export function ConfigurationProvider({
  configuration,
  children,
}: {
  configuration: Configuration;
  children: React.ReactNode;
}) {
  const [convertedConfiguration, setConvertedConfiguration] =
    useState<null | ClientConfiguration>(null);

  useEffect(() => {
    const convertedConfiguration = convertConfiguration(configuration);
    setConfiguration(convertedConfiguration);
    setConvertedConfiguration(convertedConfiguration);
  }, [configuration]);

  return isNullish(convertedConfiguration) ? null : (
    <ConfigurationContext value={{ configuration: convertedConfiguration }}>
      {children}
    </ConfigurationContext>
  );
}
