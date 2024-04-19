'use client';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  });
  return (
    <html>
      <body>
        <h1>Jokin meni vikaan</h1>
        <button onClick={() => reset()}>Yritä uudelleen</button>
      </body>
    </html>
  );
}
