import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { GlobalModalProvider } from '@/components/modals/global-modal';
import { Toaster } from '@/components/toaster';
import { FullSpinner } from '@/components/full-spinner';

/**
 * Sovelluksen juurireitin layout. Sisältää providerit, jotka tarvitsevat
 * react-routerin kontekstin.
 */
export default function RootLayout() {
  return (
    <NuqsAdapter>
      <Toaster />
      <GlobalModalProvider>
        <Suspense fallback={<FullSpinner />}>
          <Outlet />
        </Suspense>
      </GlobalModalProvider>
    </NuqsAdapter>
  );
}
