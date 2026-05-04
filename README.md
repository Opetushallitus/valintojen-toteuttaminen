# valintojen-toteuttaminen

[![Build](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml)

Valintojen toteuttamisen käyttöliittymä

## Lokaaliajo

Voit käyttää lokaaliajossa [mkcert](https://github.com/FiloSottile/mkcert)-työkalulla luotuja sertifikaatteja. Luo sertifikaatit ajamalla komento:

`pnpm run create-dev-certs`

ja ota sertifikaatit käyttöön node.js:ssä

`pnpm run node-extra-ca-certs`

Asenna riippuvuudet komennolla:

`pnpm install`

Sen jälkeen käynnistä palvelu komennolla:

`pnpm dev`

Tiedostossa `.env.development` on asetettu ympäristömuuttujia, joiden avulla voi vaikuttaa lokaaliajon toimintaan. Voit muokata arvoja itsellesi sopiviksi luomalla `.env.development.local`-tiedoston, jonka arvot yliajavat `.env.development`-tiedostossa asetetut arvot. Alä muuta `.env.development`-tiedostoa, jos et halua muuttaa oletusarvoja, jotka tulevat käyttöön myös kaikille muille kehittäjille.

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

## Asennus ympäristöön (deploy)

### Asennus GitHub Actionilla

Suositeltu tapa asentaa sovellus ympäristöön on [GitHub Actionilla](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/deploy.yml).

1. Napsauta alasvetovalikko auki kohdasta "Run workflow from"
2. Valitse "Use workflow from"-valikosta Git-haara, josta haluat ajaa deploy-workflown. Tätä tarvitsee muuttaa vain, jos olet tehnyt muutoksia deployn käyttämiin tiedostoihin.
3. Kirjoita buildin numero (esim. 970) kohtaan "Github Actions build number".
4. Valitse ympäristö, johon asennetaan kohdasta "Environment where to deploy "

## Asennus deploy.sh-skriptillä

Asentaminen on mahdollista myös deploy.sh-skriptillä, mutta ei suositeltua.
Skriptillä asennettaessa kehittäjällä täytyy olla tarvittavat oikeudet AWS-infran muokkaukseen, joita etenkään tuotantoon ei kaikilla ole.

Asenna ensin sovelluksen riippuvuudet ja buildaa next.js sovellus:

    pnpm install
    pnpm run build

Deploy untuvalle onnistuu komennolla:

    ./deploy.sh untuva deploy -d
