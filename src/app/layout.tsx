import type { Metadata } from 'next';
import ReactQueryClientProvider from './components/react-query-client-provider';
import LocalizationProvider from './localization-provider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { checkAccessibility } from './lib/checkAccessibility';
import PermissionProvider from './permission-provider';
import { Toaster } from './components/toaster';
import Script from 'next/script';
import { configuration } from './lib/configuration';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './theme-provider';

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
          <ReactQueryClientProvider>
            <CssBaseline />
            <PermissionProvider>
              <LocalizationProvider>
                <ThemeProvider>
                  <Toaster />
                  {children}
                </ThemeProvider>
              </LocalizationProvider>
            </PermissionProvider>
          </ReactQueryClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

checkAccessibility();
