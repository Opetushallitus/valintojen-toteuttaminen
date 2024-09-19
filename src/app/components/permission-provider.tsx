'use client';
import { FullSpinner } from '@/app/components/full-spinner';
import { ErrorView } from '@/app/components/error-view';
import { useQueryUserPermissions } from '@/app/hooks/useUserPermissions';

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
      return <ErrorView error={error} reset={() => {}} />;
    default:
      return children;
  }
}
