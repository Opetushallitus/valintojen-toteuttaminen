import { isTesting, localTranslations } from '../configuration/configuration';
import { BackendFetch, DevTools, Tolgee } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import { getConfiguration } from '@/lib/configuration/client-configuration';

const REVALIDATE_TIME_SECONDS = 10 * 60;

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
      staticData: {
        fi: () => import('./messages/fi.json'),
        sv: () => import('./messages/sv.json'),
        en: () => import('./messages/en.json'),
      },
    });
  } else {
    return tg
      .use(
        BackendFetch({
          prefix: getConfiguration().routes.yleiset.lokalisointiUrl,
          next: {
            revalidate: REVALIDATE_TIME_SECONDS,
          },
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
