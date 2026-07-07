import { RouterProvider } from 'react-router';
import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import ReactQueryClientProvider from '@/components/providers/react-query-client-provider';
import { ConfigurationProvider } from '@/components/providers/configuration-provider';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/components/providers/localization-provider';
import { PermissionProvider } from '@/components/providers/permission-provider';
import { LocalizedThemeProvider } from '@/components/providers/localized-theme-provider';
import { Configuration } from '@/lib/configuration/configuration';
import { THEME_OVERRIDES } from '@/lib/theme';
import { router } from './router';

export function App({ configuration }: { configuration: Configuration }) {
  return (
    /* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */
    <OphThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
      <ReactQueryClientProvider>
        <ConfigurationProvider configuration={configuration}>
          <MyTolgeeProvider>
            <PermissionProvider>
              <LocalizationProvider>
                <LocalizedThemeProvider>
                  <RouterProvider router={router} />
                </LocalizedThemeProvider>
              </LocalizationProvider>
            </PermissionProvider>
          </MyTolgeeProvider>
        </ConfigurationProvider>
      </ReactQueryClientProvider>
    </OphThemeProvider>
  );
}
