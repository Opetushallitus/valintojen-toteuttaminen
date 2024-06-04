'use client';
import { FullSpinner } from './components/full-spinner';
import { useQueryUserRights } from './hooks/useUserRights';

export default function AuthenticationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError, error } = useQueryUserRights();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      throw error;
    default:
      return <>{children}</>;
  }
}
