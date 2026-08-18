import { useParams } from 'react-router';

/**
 * Kuten react-routerin useParams, mutta tyypittää parametrit pakollisiksi.
 * Käytä vain komponenteissa, jotka renderöidään reitillä, jolla annetut
 * parametrit ovat aina olemassa.
 */
export function useRequiredParams<
  T extends Record<string, string>,
>(): Readonly<T> {
  return useParams() as T;
}
