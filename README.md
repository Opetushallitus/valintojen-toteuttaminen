# valintojen-toteuttaminen

[![Build](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/valintojen-toteuttaminen/actions/workflows/build.yml)

Valintojen toteuttamisen käyttöliittymä.

Frontend on [React Router](https://reactrouter.com) -pohjainen SPA framework-moodissa
(`@react-router/dev`, `ssr: false`), buildattuna [Vitellä](https://vite.dev) (repon juuressa).
Reitit määritellään `src/app/routes.ts`:ssä, juurikomponentti on `src/app/root.tsx` ja
selaimen entry `src/app/entry.client.tsx`. Käyttöliittymän tarjoilee tuotannossa Spring Boot
-sovellus (`server/`-hakemistossa), joka paketoidaan fat-jariksi ja Docker-kontiksi.

Buildi (`pnpm run build` = `react-router build`) tuottaa staattisen SPA:n hakemistoon `dist/client`,
jonka Spring Boot kopioi jariin.

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

Päivittäisessä frontend-kehityksessä Spring Boot -backendia **ei tarvita** — käytä siihen Viten
dev-serveriä (`pnpm dev`). Spring Boot -ajo on tarkoitettu tuotannonkaltaisen kontin toiminnan
varmistamiseen: staattisten tiedostojen tarjoilu, SPA-syvälinkkien fallback, konfiguraatiorajapinta,
CSP-headerit ja health-endpoint.

### Esivaatimukset

- JDK 21 (esim. Corretto). Tarkista: `java -version`
- Maven 3.9+ (`mvn -version`)
- Node ja pnpm asennetaan automaattisesti `server/target/`-hakemistoon frontend-maven-pluginilla,
  joten niitä ei tarvitse asentaa erikseen buildia varten.

`pnpm install` tarvitsee `@opetushallitus`-pakettien lataamiseen GitHub Packages -autentikoinnin.
Varmista, että `~/.npmrc`:ssä on `//npm.pkg.github.com/:_authToken=<token>` (token, jolla on
`read:packages`-oikeus).

### Ajo Mavenilla (suositeltu)

    cd server
    mvn spring-boot:run

Komento rakentaa frontendin (`pnpm run build` → repon juuren `dist/`), kopioi sen Spring Bootin
tarjoiltavaksi ja käynnistää sovelluksen osoitteeseen
<http://localhost:8080/valintojen-toteuttaminen>. Konfiguraatio luetaan tiedostosta
`server/valintojen-toteuttaminen-dev.yml` (oletuksena untuvan virkailija-palvelut).

Voit osoittaa eri ympäristöön tai porttiin ilman tiedoston muokkaamista antamalla arvot komennolla:

    mvn spring-boot:run -Dspring-boot.run.arguments="--host.virkailija=virkailija.hahtuvaopintopolku.fi --server.port=8081"

### Ajo fat-jarina

    cd server
    mvn clean package
    java -Dspring.config.location=./valintojen-toteuttaminen-dev.yml -jar target/valintojen-toteuttaminen-0.1.0-SNAPSHOT.jar

### Tarkistukset

Kun sovellus on käynnissä, voit varmistaa toiminnan:

    curl http://localhost:8080/valintojen-toteuttaminen/actuator/health          # {"status":"UP"}
    curl http://localhost:8080/valintojen-toteuttaminen/rest/config/frontProperties
    curl -o /dev/null -w "%{http_code}\n" http://localhost:8080/valintojen-toteuttaminen/haku/x/hakukohde  # 200 (SPA-fallback)

### Rajoitus: autentikointi ja API-kutsut

Lokaalisti sovellus tarjoillaan osoitteesta `localhost:8080`, mutta selain tekee palvelukutsut
suoraan virkailija-domainiin (esim. `https://virkailija.untuvaopintopolku.fi`). Nämä ovat
cross-origin-kutsuja, joten CAS-kirjautuminen ja istuntoevästeet **eivät toimi** tässä ajossa —
toisin kuin tuotannossa, jossa sovellus tarjoillaan samasta originista kuin virkailija-palvelut.

Jos tarvitset toimivan kirjautumisen ja API-kutsut lokaalisti, käytä Viten dev-serveriä
(`pnpm dev`), joka proxyttaa palvelukutsut samasta originista virkailija-ympäristöön.

## Arkkitehtuuripäätös: React Query ja XState -tilakoneet

Data haetaan React Queryllä (`useSuspenseQuery`/`useSuspenseQueries`, esiladataan tarvittaessa
reittien `clientLoader`-funktioissa) ja lomakkeiden muokkaustila hallitaan XState-tilakoneilla.
Näiden rakenteessa noudatetaan seuraavaa yhtenäistä mallia (ks. esim. `src/lib/state/jono-tulos-state.ts`):

- **Data annetaan tilakoneelle `input`-parametrina.** XStaten React-hookit lukevat `input`:n vain kerran, aktorin luonnissa, eikä tilakone synkronoi dataa React Queryn kanssa jälkikäteen.
- **Tilakone resetoidaan vaihtamalla komponentin `key`-attribuuttia, kun data muuttuu.** Tilakonetta
  käyttävälle komponentille annetaan key-attribuutti, joka sisältää datan tunnisteen ja päivitysajan, esim.
  ``key={`${hakukohdeOid}_${dataUpdatedAt}`}`` (React Queryn `dataUpdatedAt`). Kun query päivittyy
  (esim. tallennuksen jälkeisen invalidoinnin seurauksena), React tuhoaa komponentin ja luo sen
  uudelleen, jolloin myös tilakone alustetaan tuoreella datalla.
- **React-riippuvaiset funktiot annetaan `.provide()`-kutsulla.** Tilakoneen määrittelyssä
  toiminnoille (esim. toastit näyttävä `notify`) annetaan tyhjät oletustoteutukset, ja
  varsinaiset toteutukset annetaan hookissa `machine.provide({ actions: ... })`-kutsulla. Näin tilakone käyttää aina viimeisimmän renderöinnin funktioviittauksia eikä
  aktorin luontihetkellä kaapattuja vanhentuneita sulkeumia.

### Miksi tämä malli?

Vaihtoehtoja, joita mallia valittaessa harkittiin:

- **Datan haku tilakoneen sisällä (`fromPromise`-aktorit).** Tällöin menetettäisiin React Queryn
  välimuisti, pyyntöjen yhdistäminen, Suspense-tuki ja esilataus `clientLoader`-funktioissa, ja
  samaa dataa käyttävät näkymät hakisivat sen kukin erikseen. React Query on siksi ainoa
  palvelindatan lähde, ja tilakoneet hallitsevat vain muokkaustilaa ja tallennuksen kulkua.
- **Datan synkronointi käynnissä olevaan tilakoneeseen** (esim. `useEffect`, joka lähettää
  `DATA_UPDATED`-eventin). Jokaiseen tilakoneeseen tarvittaisiin oma logiikka uuden datan
  yhdistämiseen keskeneräisiin muutoksiin sekä myös sen varmistamiseksi, ettei tilakonetta alusteta jatkuvasti uudelleen, jos dataa epähuomoissa päivitetään jatkuvasti (esim. unohtunut `useMemo`). Lisäksi komponentti renderöityisi ainakin kerran
  vanhalla tilalla ennen kuin efekti ajetaan. Key-attribuutin vaihdolla alustus tapahtuu aina samalla tavalla, eikä tilakoneiden tarvitse tietää datan päivittymisestä mitään.
- **Uuden tilakoneen luominen renderissä (esim. `useMemo`, joka riippuu datasta).** Tämä ei
  toimi: XStaten React-hookit luovat kyllä uuden aktorin,
  jos koneen `config` muuttuu, mutta palauttavat sen edellisen aktorin tallennetusta snapshotista.
  Tila ja context säilyvät, eikä `input`:ia lueta uudelleen.
- **Callbackien välittäminen `input`:ssa tai contextissa.** Funktiot kaapattaisiin aktorin
  luontihetkellä, joten ne vanhenisivat renderöintien välillä. Lisäksi context täyttyisi
  arvoilla, joita ei voi sarjallistaa, mikä sotkee mm. XState-inspectorin näkymää. `.provide()`
  pitää koneen määrittelyn Reactista riippumattomana, joten konetta voi testata yksikkötesteissä
  omilla toteutuksilla.
- **Pelkkä Reactin tila (`useState`/`useReducer`) ilman XStatea.** Tallennuksen, validoinnin ja
  vahvistusdialogien monivaiheiset asynkroniset kulut ovat selkeämpiä ja paremmin testattavissa
  tilakoneina. Yhtenäinen malli tekee lisäksi kaikista sovelluksen tilakoneista samalla tavalla
  luettavia.

Mallin rajoitus on se, että key-vaihto tuhoaa komponentin koko paikallisen tilan (myös
tallentamattomat muutokset). Siksi queryjä ei haeta automaattisesti uudelleen taustalla
(`refetchOnWindowFocus: false` ja `refetchOnReconnect: false` tiedostossa
`src/components/providers/react-query-client-provider.tsx`), vaan data päivittyy vain
käyttäjän omien toimintojen, kuten tallennuksen, seurauksena.

## Testaus

Aja yksikkötestit komennolla:

`pnpm test`

### Kälitestit

Kälitestit ajetaan buildattua SPA:ta vasten kevyellä esikatselupalvelimella
(`preview-server.mjs`), joka tarjoilee `dist/client`-hakemiston ja proxyttaa palvelukutsut
mock-backendille. Käynnistä palvelin (buildaa ja tarjoilee testimoodissa) komennolla:

`pnpm run start-test`

Aja sen jälkeen testit komennolla:

`pnpm exec playwright test`

Jos haluat ajaa testit vain tietyllä selaimella niin se onnistuu komennolla:

`pnpm exec playwright test --project=firefox`

Jos haluat ajaa vain tietyn testitiedoston, se onnistuu komennolla:

`pnpm exec playwright test --project=chromium tests/e2e/lokalisointi.spec.ts`

Testit voi ajaa myös Docker-kontissa (sama ympäristö kuin CI:ssä) — tämä myös käynnistää
palvelimen automaattisesti:

`pnpm run start-and-test-playwright-docker`

tai suoraan jo käynnissä olevaa palvelinta vasten:

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
