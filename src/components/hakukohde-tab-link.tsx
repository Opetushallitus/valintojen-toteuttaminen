import { useHakukohdeSearchUrlParams } from '@/hooks/useHakukohdeSearch';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { type LinkProps } from 'next/link';
import { BlockerLink } from './blocker-link';

export const HakukohdeTabLink = ({
  hakuOid,
  hakukohdeOid,
  children,
  tabRoute,
  ...props
}: Omit<LinkProps, 'href'> &
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
      href={{
        pathname: `/haku/${hakuOid}/hakukohde/${hakukohdeOid}/${tabRoute}`,
        query: hakukohdeSearchParams,
      }}
      prefetch={false}
    >
      {children}
    </BlockerLink>
  );
};
