'use client';

import { styled } from '@/app/lib/theme';
import Link, { LinkProps } from 'next/link';
import { useSearchParams } from 'next/navigation';

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  paddingLeft: theme.spacing(1),
  width: '100%',
}));

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
    <StyledLink
      {...props}
      href={{
        pathname: `/haku/${hakuOid}/valintaryhma/${valintaryhmaOid}`,
        query: vrSearchParam && { vrsearch: vrSearchParam },
      }}
    >
      {children}
    </StyledLink>
  );
};
