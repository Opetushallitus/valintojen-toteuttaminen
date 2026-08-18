import { getConfiguration } from '@/lib/configuration/client-configuration';
import { Configuration } from '@/lib/configuration/configuration';
import { createContext } from 'react';

export const ConfigurationContext = createContext<{
  configuration: null | Configuration;
}>({ configuration: null });

export function ConfigurationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Konfiguraatio on asetettu globaalisti ennen renderöintiä (entry.client.tsx).
  return (
    <ConfigurationContext value={{ configuration: getConfiguration() }}>
      {children}
    </ConfigurationContext>
  );
}
