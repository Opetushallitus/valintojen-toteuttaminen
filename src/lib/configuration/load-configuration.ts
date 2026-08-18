import { BASE_PATH } from '@/lib/base-path';
import { buildConfiguration } from './build-configuration';
import { Configuration, isDev, isTesting } from './configuration';

/**
 * Lataa sovelluksen konfiguraation. Lokaaliajossa ja testeissä palvelukutsut
 * tehdään sovelluksen omaan osoitteeseen (dev-proxy välittää ne eteenpäin).
 * Tuotannossa virkailija-domain haetaan backendin konfiguraatiorajapinnasta.
 */
export async function loadConfiguration(): Promise<Configuration> {
  if (isDev || isTesting) {
    return buildConfiguration({
      domain: import.meta.env.VITE_APP_URL ?? window.location.origin,
    });
  }
  const response = await fetch(`${BASE_PATH}/rest/config/frontProperties`);
  if (!response.ok) {
    throw new Error(
      `Konfiguraation lataaminen epäonnistui (${response.status})`,
    );
  }
  const properties: { virkailijaUrl: string } = await response.json();
  return buildConfiguration({ domain: properties.virkailijaUrl });
}
