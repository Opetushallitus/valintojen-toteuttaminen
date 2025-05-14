import type { Metadata } from 'next';
import ReactQueryClientProvider from '../components/providers/react-query-client-provider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { checkAccessibility } from '../lib/checkAccessibility';
import { Toaster } from '../components/toaster';
import Script from 'next/script';
import { isDev } from '../lib/configuration/configuration';
import { LocalizedThemeProvider } from '../components/providers/localized-theme-provider';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import { THEME_OVERRIDES } from '../lib/theme';
import { GlobalModalProvider } from '../components/modals/global-modal';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import NextTopLoader from 'nextjs-toploader';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/components/providers/localization-provider';
import { PermissionProvider } from '@/components/providers/permission-provider';
import { ConfigurationProvider } from '@/components/providers/configuration-provider';
import { buildConfiguration } from '@/lib/configuration/configuration';

export const metadata: Metadata = {
  title: 'Valintojen Toteuttaminen',
  description: 'Valintojen toteuttamisen käyttöliittymä',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const configuration = await buildConfiguration();

  return (
    <html lang="fi">
      <Script src={configuration.routes.yleiset.raamitUrl} />
      <body>
        {isDev && <NextTopLoader />}
        <AppRouterCacheProvider>
          {/* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */}
          <OphNextJsThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
            <ReactQueryClientProvider>
              <ConfigurationProvider configuration={configuration}>
                <MyTolgeeProvider>
                  <PermissionProvider>
                    <LocalizationProvider>
                      <LocalizedThemeProvider>
                        <NuqsAdapter>
                          <Toaster />
                          <GlobalModalProvider>{children}</GlobalModalProvider>
                        </NuqsAdapter>
                      </LocalizedThemeProvider>
                    </LocalizationProvider>
                  </PermissionProvider>
                </MyTolgeeProvider>
              </ConfigurationProvider>
            </ReactQueryClientProvider>
          </OphNextJsThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

checkAccessibility();
