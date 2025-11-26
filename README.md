# valintojen-toteuttaminen

[![Build](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml)

Valintojen toteuttamisen käyttöliittymä

## Lokaaliajo

Voit käyttää lokaaliajossa [mkcert](https://github.com/FiloSottile/mkcert)-työkalulla luotuja sertifikaatteja. Luo sertifikaatit ajamalla komento:

`pnpm run create-dev-certs`

ja ota sertifikaatit käyttöön node.js:ssä

`pnpm run node-extra-ca-certs`

Asenna riippuvuudet komennolla:

`pnpm install --frozen-lockfile`

Sen jälkeen käynnistä palvelu komennolla:

`pnpm dev`

## Testaus

Aja yksikkötestit komennolla:

`pnpm test`

### Kälitestit

Käynnistä sovelluskomennolla:

`pnpm run dev-test`

Aja sen jälkeen testit komennolla:

`pnpm exec playwright test`

Jos haluat ajaa testit vain tietyllä selaimella niin se onnistuu komennolla:

`pnpm exec playwright test --project=firefox`

Jos haluat ajaa vain tietyn testitiedoston, se onnistuu komennolla:

`pnpm exec playwright test --project=chromium tests/e2e/lokalisointi.spec.ts`

## Deploy

Asenna ensin sovelluksen riippuvuudet ja buildaa next.js sovellus:

    pnpm install --frozen-lockfile
    pnpm run build

Deploy untuvalle onnistuu komennolla:

    ./deploy.sh untuva deploy -d
