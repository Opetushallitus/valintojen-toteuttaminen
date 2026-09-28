import { ReactNode } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Yksi jaettu QueryClient-instanssi. Sovelluksessa on vain yksi
 * ReactQueryClientProvider (juuressa), joten tämä vastaa käytökseltään
 * aiempaa `useState(() => new QueryClient(...))`-alustusta, mutta on lisäksi
 * tuotavissa React-puun ulkopuolelta esim. reittien clientLoader-funktioihin.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      throwOnError: true,
      staleTime: 10 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function ReactQueryClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
