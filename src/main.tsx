import { createRoot } from 'react-dom/client';
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
  const rootElement = document.getElementById('root')!;
  try {
    const configuration = await loadConfiguration();
    setConfiguration(configuration);
    injectRaamit(configuration.routes.yleiset.raamitUrl);
    // Ladataan App (ja sen importtaama lokalisointimoduuli) vasta konfiguraation
    // asettamisen jälkeen, koska osa moduuleista lukee konfiguraation jo
    // moduulitasolla (mm. Tolgeen alustus tuotannossa).
    const [{ App }, { checkAccessibility }] = await Promise.all([
      import('./App'),
      import('@/lib/checkAccessibility'),
    ]);
    checkAccessibility();
    createRoot(rootElement).render(<App configuration={configuration} />);
  } catch (error) {
    rootElement.textContent =
      'Sovelluksen käynnistäminen epäonnistui. Yritä myöhemmin uudelleen.';
    throw error;
  }
}

void start();
