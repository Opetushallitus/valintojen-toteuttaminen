import type { Metadata } from 'next';
import ReactQueryClientProvider from '../components/providers/react-query-client-provider';
import LocalizationProvider from '../components/providers/localization-provider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { checkAccessibility } from '../lib/checkAccessibility';
import { Toaster } from '../components/toaster';
import Script from 'next/script';
import { configuration, isDev } from '../lib/configuration';
import { LocalizedThemeProvider } from '../components/providers/localized-theme-provider';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import PermissionProvider from '../components/providers/permission-provider';
import { THEME_OVERRIDES } from '../lib/theme';
import { GlobalModalProvider } from '../components/modals/global-modal';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'Valintojen Toteuttaminen',
  description: 'Valintojen toteuttamisen käyttöliittymä',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <Script src={configuration.raamitUrl} />
      <body>
        {isDev && <NextTopLoader />}
        <AppRouterCacheProvider>
          {/* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */}
          <OphNextJsThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
            <ReactQueryClientProvider>
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
            </ReactQueryClientProvider>
          </OphNextJsThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

checkAccessibility();
