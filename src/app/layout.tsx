import React from 'react';
import type { Metadata } from 'next';
import ReactQueryClientProvider from './components/react-query-client-provider';
import LocalizationProvider from './localization-provider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/app/theme';
import { checkAccessibility } from './lib/checkAccessibility';
import PermissionProvider from './permission-provider';
import { CssBaseline } from '@mui/material';
import { Toaster } from './components/toaster';
import Script from 'next/script';
import { configuration } from './lib/configuration';

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
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <PermissionProvider>
                <LocalizationProvider>
                  <Toaster />
                  {children}
                </LocalizationProvider>
              </PermissionProvider>
            </ThemeProvider>
          </ReactQueryClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

checkAccessibility();
