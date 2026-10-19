import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { checkAccessibility } from '@/lib/checkAccessibility';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { loadConfiguration } from '@/lib/configuration/load-configuration';

/**
 * Poistaa CAS-kirjautumisesta jääneen ticket-parametrin osoitteesta
 * (korvaa Next.js-middlewaren).
 */
function stripCasTicket() {
  const url = new URL(window.location.href);
  if (url.searchParams.has('ticket')) {
    url.searchParams.delete('ticket');
    window.history.replaceState(null, '', url);
  }
}

const PRELOAD_ERROR_RELOAD_KEY = 'vite-preload-error-reload-at';
const PRELOAD_ERROR_RELOAD_INTERVAL_MS = 10_000;

/**
 * Viten riippuvuuksien uudelleenoptimointi voi katkaista reittimoduulin
 * importin kesken ja jättää navigoinnin jumiin. Korjataan uudelleenlatauksella.
 * Jos lataus epäonnistuu uudelleen heti latauksen jälkeen (esim. moduuli
 * puuttuu pysyvästi), ei ladata uudelleen, jotta vältetään ikuinen silmukka,
 * vaan annetaan virheen edetä virhenäkymään.
 */
function registerPreloadErrorReload() {
  window.addEventListener('vite:preloadError', (event) => {
    let lastReloadAt = 0;
    try {
      lastReloadAt = Number(
        window.sessionStorage.getItem(PRELOAD_ERROR_RELOAD_KEY) ?? 0,
      );
    } catch {
      // sessionStorage ei käytettävissä
    }
    const now = Date.now();
    if (now - lastReloadAt < PRELOAD_ERROR_RELOAD_INTERVAL_MS) {
      return;
    }
    try {
      window.sessionStorage.setItem(PRELOAD_ERROR_RELOAD_KEY, String(now));
    } catch {
      // Ilman sessionStoragea ei voida estää silmukkaa, joten ei ladata uudelleen
      return;
    }
    event.preventDefault();
    window.location.reload();
  });
}

async function start() {
  registerPreloadErrorReload();
  stripCasTicket();
  // Ladataan konfiguraatio ennen hydraatiota, jotta getConfiguration()-globaali
  // on asetettu ennen kuin reittimoduulit (ja mm. Tolgeen alustus) evaluoituvat.
  const configuration = await loadConfiguration();
  setConfiguration(configuration);
  checkAccessibility();
  startTransition(() => {
    // useTransitions={false}, koska oletusarvoisesti react-router kääri jokaisen
    // reitityksen tilapäivityksen React.startTransition-kutsuun. Tämä saa Reactin
    // pitämään edellisen sivun sisällön näkyvissä sen sijaan, että se näyttäisi
    // heti Suspense-fallbackin (esim. spinnerin), kun jo näkyvissä ollut
    // Suspense-rajapinta suspendoituu uudelleen navigoinnin yhteydessä.
    hydrateRoot(document, <HydratedRouter useTransitions={false} />);
  });
}

void start();
