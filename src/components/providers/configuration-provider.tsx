'use client';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { Configuration } from '@/lib/configuration/server-configuration';
import { createContext, useEffect } from 'react';

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
  useEffect(() => {
    setConfiguration(configuration);
  }, [configuration]);

  return (
    <ConfigurationContext value={{ configuration }}>
      {children}
    </ConfigurationContext>
  );
}
