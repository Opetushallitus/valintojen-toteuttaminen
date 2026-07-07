import { useHakukohdeSearchUrlParams } from '@/hooks/useHakukohdeSearch';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { type LinkProps } from 'react-router';
import { BlockerLink } from './blocker-link';

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
    <BlockerLink
      {...props}
      to={{
        pathname: `/haku/${hakuOid}/hakukohde/${hakukohdeOid}/${tabRoute}`,
        search: hakukohdeSearchParams
          ? `?${new URLSearchParams(hakukohdeSearchParams)}`
          : undefined,
      }}
    >
      {children}
    </BlockerLink>
  );
};
