'use client';
import { FullSpinner } from './components/full-spinner';
import { useQueryUserPermissions } from './hooks/useUserPermissions';

export default function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError, error } = useQueryUserPermissions();

  switch (true) {
    case isLoading:
      return <FullSpinner />;
    case isError:
      throw error;
    default:
      return children;
  }
}