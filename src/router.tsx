import { createBrowserRouter } from 'react-router';
import { BASE_PATH } from '@/lib/base-path';
import { RedirectWithSearch } from '@/components/redirect-with-search';
import { RouteErrorView } from '@/components/route-error-view';
import RootLayout from '@/app/root-layout';
import HakuListLayout from '@/app/(root)/layout';
import Home from '@/app/(root)/page';
import SeurantaLayout from '@/app/seuranta/layout';
import HakuLayout from '@/app/haku/[oid]/layout';
import HakukohdeListLayout from '@/app/haku/[oid]/hakukohde/layout';
import HakukohdePage from '@/app/haku/[oid]/hakukohde/page';
import HakukohdeTabsLayout from '@/app/haku/[oid]/hakukohde/[hakukohde]/layout';
import HenkiloLayout from '@/app/haku/[oid]/henkilo/layout';
import HenkiloIndexPage from '@/app/haku/[oid]/henkilo/page';
import ValintaryhmaLayout from '@/app/haku/[oid]/valintaryhma/layout';
import ValintaryhmaIndexPage from '@/app/haku/[oid]/valintaryhma/page';
import NotFound from '@/app/not-found';

/**
 * Lazy-ladataan raskaat sivut, jotta koodinjako toimii kuten ennenkin
 * (Next.js jakoi koodin sivuittain).
 */
const lazyPage =
  (importPage: () => Promise<{ default: React.ComponentType }>) => async () => {
    const { default: Component } = await importPage();
    return { Component };
  };

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: RootLayout,
      errorElement: <RouteErrorView />,
      children: [
        {
          Component: HakuListLayout,
          children: [{ index: true, Component: Home }],
        },
        {
          path: 'seuranta',
          Component: SeurantaLayout,
          children: [
            {
              index: true,
              lazy: lazyPage(() => import('@/app/seuranta/page')),
            },
          ],
        },
        {
          path: 'haku/:oid',
          Component: HakuLayout,
          errorElement: <RouteErrorView />,
          children: [
            {
              index: true,
              element: <RedirectWithSearch to="hakukohde" />,
            },
            {
              path: 'hakukohde',
              Component: HakukohdeListLayout,
              children: [
                { index: true, Component: HakukohdePage },
                {
                  path: ':hakukohde',
                  Component: HakukohdeTabsLayout,
                  children: [
                    {
                      index: true,
                      element: <RedirectWithSearch to="perustiedot" />,
                    },
                    {
                      path: 'perustiedot',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/perustiedot/page'),
                      ),
                    },
                    {
                      path: 'hakeneet',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/hakeneet/page'),
                      ),
                    },
                    {
                      path: 'hakijaryhmat',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/hakijaryhmat/page'),
                      ),
                    },
                    {
                      path: 'harkinnanvaraiset',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/harkinnanvaraiset/page'),
                      ),
                    },
                    {
                      path: 'pistesyotto',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/pistesyotto/page'),
                      ),
                    },
                    {
                      path: 'valintakoekutsut',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/valintakoekutsut/page'),
                      ),
                    },
                    {
                      path: 'valinnan-hallinta',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/valinnan-hallinta/page'),
                      ),
                    },
                    {
                      path: 'valinnan-tulokset',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/valinnan-tulokset/page'),
                      ),
                    },
                    {
                      path: 'valintalaskennan-tulokset',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/valintalaskennan-tulokset/page'),
                      ),
                    },
                    {
                      path: 'sijoittelun-tulokset',
                      lazy: lazyPage(
                        () =>
                          import('@/app/haku/[oid]/hakukohde/[hakukohde]/sijoittelun-tulokset/page'),
                      ),
                    },
                  ],
                },
              ],
            },
            {
              path: 'henkilo',
              Component: HenkiloLayout,
              children: [
                { index: true, Component: HenkiloIndexPage },
                {
                  path: ':hakemusOid',
                  lazy: lazyPage(
                    () => import('@/app/haku/[oid]/henkilo/[hakemusOid]/page'),
                  ),
                },
              ],
            },
            {
              path: 'valintaryhma',
              Component: ValintaryhmaLayout,
              children: [
                { index: true, Component: ValintaryhmaIndexPage },
                {
                  path: ':valintaryhma',
                  lazy: lazyPage(
                    () =>
                      import('@/app/haku/[oid]/valintaryhma/[valintaryhma]/page'),
                  ),
                },
              ],
            },
            {
              path: 'yhteisvalinnan-hallinta',
              lazy: lazyPage(
                () => import('@/app/haku/[oid]/yhteisvalinnan-hallinta/page'),
              ),
            },
          ],
        },
        { path: '*', Component: NotFound },
      ],
    },
  ],
  { basename: BASE_PATH },
);
