import { isTesting, localTranslations } from '../configuration/configuration';
import { BackendFetch, DevTools, Tolgee } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import { getConfiguration } from '@/lib/configuration/client-configuration';

const NAMESPACE = 'valintojen-toteuttaminen';

export function TolgeeBase() {
  const tg = Tolgee()
    .use(FormatIcu())
    .updateDefaults({
      availableLanguages: ['fi', 'sv', 'en'],
      defaultLanguage: 'fi',
    });

  if (isTesting || localTranslations) {
    return tg.updateDefaults({
      // Puretaan .default, koska Vite tarjoaa JSON-moduulin nimettyinä
      // exportteina vain kelvollisille tunnisteille — väliviivalliset
      // ylätason avaimet (esim. "haku-tabs") löytyvät vain default-exportista.
      staticData: {
        fi: () => import('./messages/fi.json').then((m) => m.default),
        sv: () => import('./messages/sv.json').then((m) => m.default),
        en: () => import('./messages/en.json').then((m) => m.default),
      },
    });
  } else {
    // getConfiguration() on undefined selaimen ulkopuolella (SPA-buildin
    // prerender): tolgeen backend-hakua ei silloin käytetä, joten tyhjä prefix
    // riittää. Selaimessa konfiguraatio on asetettu ennen tämän evaluointia.
    const lokalisointiUrl =
      getConfiguration()?.routes.yleiset.lokalisointiUrl ?? '';
    return tg
      .use(
        BackendFetch({
          prefix: lokalisointiUrl,
        }),
      )
      .use(DevTools())
      .updateDefaults({
        defaultNs: NAMESPACE,
        ns: [NAMESPACE],
        projectId: 11100,
      });
  }
}
