'use client';

import {
  getConfiguration,
  setConfiguration,
} from '@/lib/configuration/client-configuration';
import { Configuration } from '@/lib/configuration/configuration';
import { createContext, useEffect, useState } from 'react';
import { isNullish } from 'remeda';

export const ConfigurationContext = createContext<{
  configuration: null | Configuration;
}>({ configuration: null });

export function ConfigurationProvider({
  configuration,
  children,
}: {
  configuration: Configuration;
  children: React.ReactNode;
}) {
  const [clientConfiguration, setClientConfiguration] =
    useState<Configuration | null>(null);

  useEffect(() => {
    setConfiguration(configuration);
    setClientConfiguration(getConfiguration());
  }, [configuration]);

  return isNullish(clientConfiguration) ? null : (
    <ConfigurationContext value={{ configuration: clientConfiguration }}>
      {children}
    </ConfigurationContext>
  );
}
