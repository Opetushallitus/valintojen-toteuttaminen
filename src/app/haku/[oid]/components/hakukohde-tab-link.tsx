import Link, { type LinkProps } from 'next/link';
import { useSearchParams } from 'next/navigation';

export const HakukohdeTabLink = ({
  hakuOid,
  hakukohdeOid,
  children,
  tabRoute,
  ...props
}: Omit<LinkProps, 'href'> & {
  hakuOid: string;
  hakukohdeOid: string;
  children: React.ReactNode;
  className?: string;
  tabRoute: string;
  tabIndex?: number;
}) => {
  const searchParams = useSearchParams();
  const hakukohdeSearchParam = searchParams.get('hksearch');

  return (
    <Link
      {...props}
      href={{
        pathname: `/haku/${hakuOid}/hakukohde/${hakukohdeOid}/${tabRoute}`,
        query: hakukohdeSearchParam && { hksearch: hakukohdeSearchParam },
      }}
    >
      {children}
    </Link>
  );
};
