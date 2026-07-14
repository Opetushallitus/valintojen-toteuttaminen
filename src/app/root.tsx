import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from 'react-router';
import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import ReactQueryClientProvider from '@/components/providers/react-query-client-provider';
import { ConfigurationProvider } from '@/components/providers/configuration-provider';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/components/providers/localization-provider';
import { PermissionProvider } from '@/components/providers/permission-provider';
import { LocalizedThemeProvider } from '@/components/providers/localized-theme-provider';
import { GlobalModalProvider } from '@/components/modals/global-modal';
import { Toaster } from '@/components/toaster';
import { FullSpinner } from '@/components/full-spinner';
import { ErrorView } from '@/components/error-view';
import { THEME_OVERRIDES } from '@/lib/theme';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Valintojen Toteuttaminen</title>
        <meta
          name="description"
          content="Valintojen toteuttamisen käyttöliittymä"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    /* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */
    <OphThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
      <script
        async
        src={window.configuration.routes.yleiset.raamitUrl}
      ></script>
      <ReactQueryClientProvider>
        <ConfigurationProvider>
          <MyTolgeeProvider>
            <PermissionProvider>
              <LocalizationProvider>
                <LocalizedThemeProvider>
                  <NuqsAdapter>
                    <Toaster />
                    <GlobalModalProvider>
                      <Outlet />
                    </GlobalModalProvider>
                  </NuqsAdapter>
                </LocalizedThemeProvider>
              </LocalizationProvider>
            </PermissionProvider>
          </MyTolgeeProvider>
        </ConfigurationProvider>
      </ReactQueryClientProvider>
    </OphThemeProvider>
  );
}

export function HydrateFallback() {
  return (
    <OphThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
      <FullSpinner ariaLabel="Ladataan..." />
    </OphThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  // ErrorView tarvitsee teeman ja käännökset. Konfiguraatio on globaali, joten
  // erillistä ConfigurationProvideria ei tarvita tolgeen taustahaulle.
  return (
    <OphThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
      <MyTolgeeProvider>
        <ErrorView
          error={error as Error}
          reset={() => window.location.reload()}
        />
      </MyTolgeeProvider>
    </OphThemeProvider>
  );
}
