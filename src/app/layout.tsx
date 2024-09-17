import type { Metadata } from 'next';
import ReactQueryClientProvider from './components/react-query-client-provider';
import LocalizationProvider from './localization-provider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { checkAccessibility } from './lib/checkAccessibility';
import PermissionProvider from './permission-provider';
import { Toaster } from './components/toaster';
import Script from 'next/script';
import { configuration } from './lib/configuration';
import { LocalizedThemeProvider } from './localized-theme-provider';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';

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
          {/* Initialisoidaan ensin lokalisoimaton teema, jotta spinnerin tyylit tulee oikein ensimmäisissä providereissa */}
          <OphNextJsThemeProvider variant="oph">
            <ReactQueryClientProvider>
              <PermissionProvider>
                <LocalizationProvider>
                  <LocalizedThemeProvider>
                    <Toaster />
                    {children}
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
