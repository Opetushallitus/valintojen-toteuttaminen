'use client';
import { ErrorView } from '../components/error-view';
import { LocalizedThemeProvider } from '../components/providers/localized-theme-provider';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <LocalizedThemeProvider>
          <ErrorView error={error} reset={reset} />
        </LocalizedThemeProvider>
      </body>
    </html>
  );
}
