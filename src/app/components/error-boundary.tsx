'use client';
import { useEffect } from 'react';
import { FetchError } from '../lib/common';

export default function Error({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | FetchError;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  });

  if (error instanceof FetchError) {
    return (
      <>
        <h1>Palvelinpyyntö epäonnistui!</h1>
        <p>Virhekoodi: {error.response.status}</p>
        <button onClick={() => reset()}>Yritä uudelleen</button>
      </>
    );
  } else {
    return (
      <>
        <h1>Jokin meni vikaan</h1>
        <button onClick={() => reset()}>Yritä uudelleen</button>
      </>
    );
  }
}
