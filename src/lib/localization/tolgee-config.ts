import { isTesting, localTranslations } from '../configuration/configuration';
import { BackendFetch, DevTools, Tolgee } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import { getConfiguration } from '@/lib/configuration/client-configuration';

const NAMESPACE = 'valintojen-toteuttaminen';

// Rakennetaan lokalisointiosoite vasta hakuhetkellä, jotta konfiguraatio on
// varmasti asetettu (framework-moodin latausjärjestys) eikä prefix jää tyhjäksi.
function buildLokalisointiPath({
  namespace,
  language,
}: {
  namespace?: string;
  language: string;
}) {
  const lokalisointiUrl = getConfiguration().routes.yleiset.lokalisointiUrl;
  return namespace
    ? `${lokalisointiUrl}/${namespace}/${language}.json`
    : `${lokalisointiUrl}/${language}.json`;
}

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
  }

  return tg
    .use(
      BackendFetch({
        // Eager property-read pitää tämän haaran mukana bundlaajan tree-shakingissa
        // (SPA-buildin prerenderissä getConfiguration() on undefined → '').
        // Varsinainen osoite rakennetaan getPath:ssa vasta hakuhetkellä.
        prefix: getConfiguration()?.routes.yleiset.lokalisointiUrl ?? '',
        getPath: buildLokalisointiPath,
      }),
    )
    .use(DevTools())
    .updateDefaults({
      defaultNs: NAMESPACE,
      ns: [NAMESPACE],
      projectId: 11100,
    });
}
