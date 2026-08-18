import { lazy, Suspense, type ComponentProps } from 'react';
import { FullClientSpinner } from './client-spinner';

const LazyOphEditor = lazy(() =>
  import('./oph-editor').then((m) => ({ default: m.OphEditor })),
);

export const DynamicOphEditor = (
  props: ComponentProps<typeof LazyOphEditor>,
) => (
  <Suspense fallback={<FullClientSpinner />}>
    <LazyOphEditor {...props} />
  </Suspense>
);
