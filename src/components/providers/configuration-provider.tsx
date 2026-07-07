import { Configuration } from '@/lib/configuration/configuration';
import { createContext } from 'react';

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
  return (
    <ConfigurationContext value={{ configuration }}>
      {children}
    </ConfigurationContext>
  );
}
