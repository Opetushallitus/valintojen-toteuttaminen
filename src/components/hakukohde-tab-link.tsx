import { useHakukohdeSearchUrlParams } from '@/hooks/useHakukohdeSearch';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { Link, type LinkProps } from 'react-router';
import { buildLinkToHakukohdeTab } from '@/lib/appLinks';

export const HakukohdeTabLink = ({
  hakuOid,
  hakukohdeOid,
  children,
  tabRoute,
  ...props
}: Omit<LinkProps, 'to'> &
  KoutaOidParams & {
    children: React.ReactNode;
    className?: string;
    tabRoute: string;
    tabIndex?: number;
  }) => {
  const hakukohdeSearchParams = useHakukohdeSearchUrlParams();

  return (
    <Link
      {...props}
      to={{
        pathname: buildLinkToHakukohdeTab({ hakuOid, hakukohdeOid, tabRoute }),
        search: hakukohdeSearchParams
          ? `?${new URLSearchParams(hakukohdeSearchParams)}`
          : undefined,
      }}
    >
      {children}
    </Link>
  );
};
