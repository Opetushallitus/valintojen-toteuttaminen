/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Virkailija-ympäristön osoite, johon dev-proxy ohjaa palvelukutsut */
  readonly VITE_VIRKAILIJA_URL?: string;
  /** Sovelluksen oma osoite lokaaliajossa */
  readonly VITE_APP_URL?: string;
  /** Ajetaanko sovellusta testimoodissa (mockatut backendit) */
  readonly VITE_TEST?: string;
  /** Käytetäänkö paikallisia käännöksiä (fi.json-tiedostosta) */
  readonly VITE_LOCAL_TRANSLATIONS?: string;
  /** Käytetäänkö statelyai inspectoria xstate-tilakoneiden debuggaamiseen */
  readonly VITE_XSTATE_INSPECT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
