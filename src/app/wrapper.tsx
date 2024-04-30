'use client';
import { FullSpinner } from './components/full-spinner';
import { useAsiointiKieli } from './lib/hooks/useAsiointiKieli';

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, isError, error } = useAsiointiKieli();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      throw error;
    default:
      return children;
  }
}
