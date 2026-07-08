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

function injectRaamit(raamitUrl: string) {
  const script = document.createElement('script');
  script.src = raamitUrl;
  document.body.appendChild(script);
}

async function start() {
  stripCasTicket();
  // Ladataan konfiguraatio ennen hydraatiota, jotta getConfiguration()-globaali
  // on asetettu ennen kuin reittimoduulit (ja mm. Tolgeen alustus) evaluoituvat.
  const configuration = await loadConfiguration();
  setConfiguration(configuration);
  injectRaamit(configuration.routes.yleiset.raamitUrl);
  checkAccessibility();
  startTransition(() => {
    hydrateRoot(document, <HydratedRouter />);
  });
}

void start();
