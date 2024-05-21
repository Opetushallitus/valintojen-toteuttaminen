# valintojen-toteuttaminen

Valintojen toteuttamisen käyttöliittymä

## Lokaaliajo

Asenna riippuvuudet komennolla:

`npm ci`

Sen jälkeen käynnistä palvelu komennolla:

`npm run dev`

## Testaus

Aja yksikkötestit komennolla:

`npm test`

### E2E-testit

Käynnistä sovelluskomennolla:

`npm run dev-test`

Aja sen jälkeen testit komennolla:

`npm run test:ui`

Jos haluat ajaa testit vain tietyllä selaimella niin se onnistuu komennolla:

`npm run test:ui -- --project=firefox`

Jos haluat ajaa vain tietyn testitiedoston, se onnistuu komennolla:

`npm run test:ui -- --project=chromium tests/e2e/lokalisointi.spec.ts`

## Deploy

Asenna ensin sovelluksen riippuvuudet ja buildaa next.js sovellus:

    npm ci
    npm run build

Deploy untuvalle onnistuu komennolla:

    ./deploy.sh untuva deploy -d
