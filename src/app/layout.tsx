import type { Metadata } from 'next';
import ReactQueryClientProvider from './components/react-query-client-provider';
import LocalizationProvider from './components/localization-provider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { checkAccessibility } from './lib/checkAccessibility';
import { Toaster } from './components/toaster';
import Script from 'next/script';
import { configuration } from './lib/configuration';
import { LocalizedThemeProvider } from './components/localized-theme-provider';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import PermissionProvider from './components/permission-provider';
import { THEME_OVERRIDES } from './lib/theme';
import { GlobalModalProvider } from './components/global-modal';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

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
