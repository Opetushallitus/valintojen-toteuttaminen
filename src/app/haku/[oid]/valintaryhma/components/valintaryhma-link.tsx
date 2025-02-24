'use client';

import Link, { LinkProps } from 'next/link';
import { useSearchParams } from 'next/navigation';

export const ValintaryhmaLink = ({
  hakuOid,
  valintaryhmaOid,
  children,
  ...props
}: Omit<LinkProps, 'href'> & {
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
  hakuOid: string;
  valintaryhmaOid: string;
}) => {
  const searchParams = useSearchParams();
  const vrSearchParam = searchParams.get('vrsearch');

  return (
    <Link
      {...props}
      style={{ textDecoration: 'none', paddingLeft: '7px', width: '100%' }}
      href={{
        pathname: `/haku/${hakuOid}/valintaryhma/${valintaryhmaOid}`,
        query: vrSearchParam && { vrsearch: vrSearchParam },
      }}
    >
      {children}
    </Link>
  );
};
