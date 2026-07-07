# valintojen-toteuttaminen

[![Build](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml)

Valintojen toteuttamisen käyttöliittymä.

Frontend on [Vite](https://vite.dev)- ja [React Router](https://reactrouter.com) -pohjainen SPA (repon juuressa).
Käyttöliittymän tarjoilee tuotannossa Spring Boot -sovellus (`server/`-hakemistossa), joka paketoidaan
fat-jariksi ja Docker-kontiksi.

## Lokaaliajo (frontend)

Voit käyttää lokaaliajossa [mkcert](https://github.com/FiloSottile/mkcert)-työkalulla luotuja sertifikaatteja. Luo sertifikaatit ajamalla komento:

`pnpm run create-dev-certs`

ja ota sertifikaatit käyttöön node.js:ssä

`pnpm run node-extra-ca-certs`

Asenna riippuvuudet komennolla:

`pnpm install`

Sen jälkeen käynnistä palvelu komennolla:

`pnpm dev`

Sovellus käynnistyy osoitteeseen <https://localhost:3404/valintojen-toteuttaminen>. Viten dev-serveri
ohjaa base-polun ulkopuoliset pyynnöt (palvelukutsut) `VITE_VIRKAILIJA_URL`-ympäristömuuttujan
osoittamaan ympäristöön (oletuksena untuva).

Tiedostossa `.env.development` on asetettu ympäristömuuttujia, joiden avulla voi vaikuttaa lokaaliajon toimintaan. Voit muokata arvoja itsellesi sopiviksi luomalla `.env.development.local`-tiedoston, jonka arvot yliajavat `.env.development`-tiedostossa asetetut arvot. Alä muuta `.env.development`-tiedostoa, jos et halua muuttaa oletusarvoja, jotka tulevat käyttöön myös kaikille muille kehittäjille.

## Lokaaliajo (Spring Boot -backend)

Päivittäisessä frontend-kehityksessä Spring Boot -backendia ei tarvita. Tuotannonkaltaisen kokonaisuuden
voi ajaa lokaalisti komennolla:

    cd server
    mvn spring-boot:run

Tämä buildaa frontendin (`pnpm run build` → `dist/`), paketoi sen Spring Bootin tarjoiltavaksi ja
käynnistää sovelluksen osoitteeseen <http://localhost:8080/valintojen-toteuttaminen> untuvan
virkailija-palveluita vasten (ks. `server/valintojen-toteuttaminen-dev.yml`).

Fat-jarin voi buildata ja ajaa komennoilla:

    cd server
    mvn clean package
    java -Dspring.config.location=./valintojen-toteuttaminen-dev.yml -jar target/valintojen-toteuttaminen-0.1.0-SNAPSHOT.jar

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

Testit voi ajaa myös Docker-kontissa (sama ympäristö kuin CI:ssä):

`pnpm run test-playwright-docker -- --project=chromium`

## Asennus ympäristöön (deploy)

GitHub Actions -workflow ([build.yml](.github/workflows/build.yml)) buildaa jokaisesta main-haaraan
viedystä muutoksesta fat-jarin, paketoi sen Docker-imageksi OPH:n
[ci-tools](https://github.com/Opetushallitus/ci-tools)-skripteillä (base-imagena
`baseimage-fatjar-openjdk21`) ja työntää imagen OPH:n container registryyn.

Asennus ympäristöihin (untuva/hahtuva/pallero/sade) tapahtuu OPH:n cloud-base-ympäristön
normaalilla image-promootiolla, ei tästä reposta käsin.

Ympäristökohtainen konfiguraatio (mm. `host_virkailija`) täytetään konttiin
`server/src/main/resources/oph-configuration/valintojen-toteuttaminen.yml.template`-tiedoston
pohjalta OPH:n konfiguraatiokoneiston toimesta.
