'use client';
import { convertConfiguration, setConfiguration } from '@/hooks/useConfiguration';
import { createContext, useEffect, useState } from 'react';
import { isNullish } from 'remeda';

export const ConfigurationContext = createContext<{configuration: Record<string, (params: Record<string, string | boolean | number>) => string>}>({configuration: {}});

export function ConfigurationProvider({
  configuration,
  children,
}: {
  configuration: Record<string, string>
  children: React.ReactNode;
}) {

  const [convertedConfiguration, setConvertedConfiguration] = useState<null | Record<string, (params: Record<string, string | boolean | number>) => string>>(null);

  useEffect(() => {
    const convertedConfiguration = convertConfiguration(configuration);
    setConfiguration(convertedConfiguration);
    setConvertedConfiguration(convertedConfiguration);
  }, [configuration]);

  return isNullish(convertedConfiguration)
    ? null
    : <ConfigurationContext.Provider value={{configuration: convertedConfiguration}}>{children}</ConfigurationContext.Provider>;
}
