import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

// Reittipolut ovat suhteessa appDirectoryyn (src/app). Reitit vastaavat
// aiempaa createBrowserRouter-puuta; framework-moodi koodinjakaa jokaisen
// reittimoduulin automaattisesti.
export default [
  // Etusivu (hakulistaus)
  layout('(root)/layout.tsx', [index('(root)/page.tsx')]),

  // Seuranta
  route('seuranta', 'seuranta/layout.tsx', [index('seuranta/page.tsx')]),

  // Haku
  route('haku/:oid', 'haku/[oid]/layout.tsx', [
    index('haku/[oid]/redirect-to-hakukohde.tsx'),

    route('hakukohde', 'haku/[oid]/hakukohde/layout.tsx', [
      index('haku/[oid]/hakukohde/page.tsx'),
      route(':hakukohde', 'haku/[oid]/hakukohde/[hakukohde]/layout.tsx', [
        index('haku/[oid]/hakukohde/[hakukohde]/redirect-to-perustiedot.tsx'),
        route(
          'perustiedot',
          'haku/[oid]/hakukohde/[hakukohde]/perustiedot/page.tsx',
        ),
        route('hakeneet', 'haku/[oid]/hakukohde/[hakukohde]/hakeneet/page.tsx'),
        route(
          'hakijaryhmat',
          'haku/[oid]/hakukohde/[hakukohde]/hakijaryhmat/page.tsx',
        ),
        route(
          'harkinnanvaraiset',
          'haku/[oid]/hakukohde/[hakukohde]/harkinnanvaraiset/page.tsx',
        ),
        route(
          'pistesyotto',
          'haku/[oid]/hakukohde/[hakukohde]/pistesyotto/page.tsx',
        ),
        route(
          'valintakoekutsut',
          'haku/[oid]/hakukohde/[hakukohde]/valintakoekutsut/page.tsx',
        ),
        route(
          'valinnan-hallinta',
          'haku/[oid]/hakukohde/[hakukohde]/valinnan-hallinta/page.tsx',
        ),
        route(
          'valinnan-tulokset',
          'haku/[oid]/hakukohde/[hakukohde]/valinnan-tulokset/page.tsx',
        ),
        route(
          'valintalaskennan-tulokset',
          'haku/[oid]/hakukohde/[hakukohde]/valintalaskennan-tulokset/page.tsx',
        ),
        route(
          'sijoittelun-tulokset',
          'haku/[oid]/hakukohde/[hakukohde]/sijoittelun-tulokset/page.tsx',
        ),
      ]),
    ]),

    route('henkilo', 'haku/[oid]/henkilo/layout.tsx', [
      index('haku/[oid]/henkilo/page.tsx'),
      route(':hakemusOid', 'haku/[oid]/henkilo/[hakemusOid]/page.tsx'),
    ]),

    route('valintaryhma', 'haku/[oid]/valintaryhma/layout.tsx', [
      index('haku/[oid]/valintaryhma/page.tsx'),
      route(':valintaryhma', 'haku/[oid]/valintaryhma/[valintaryhma]/page.tsx'),
    ]),

    route(
      'yhteisvalinnan-hallinta',
      'haku/[oid]/yhteisvalinnan-hallinta/page.tsx',
    ),
  ]),

  // 404
  route('*', 'not-found.tsx'),
] satisfies RouteConfig;
