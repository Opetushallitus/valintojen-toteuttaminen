import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReactQueryClientProvider from './components/react-query-client-provider';
import LocalizationProvider from './localization-provider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/app/theme';
import { checkAccessibility } from './lib/checkAccessibility';
import PermissionProvider from './permission-provider';
import { QuerySuspenseBoundary } from './components/query-suspense-boundary';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ReactQueryClientProvider>
            <ThemeProvider theme={theme}>
              <QuerySuspenseBoundary>
                <PermissionProvider>
                  <LocalizationProvider>{children}</LocalizationProvider>
                </PermissionProvider>
              </QuerySuspenseBoundary>
            </ThemeProvider>
          </ReactQueryClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

checkAccessibility();
