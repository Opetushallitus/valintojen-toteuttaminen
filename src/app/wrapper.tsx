'use client';
import { useAsiointiKieli } from './lib/hooks/useAsiointiKieli';
import { CircularProgress } from '@mui/material';

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, isError, error } = useAsiointiKieli();

  switch (true) {
    case isLoading:
      return <CircularProgress />;
    case isError:
      throw error;
    default:
      return children;
  }
}
