import { Box } from '@mui/material';
import { Link, LinkProps, useSearchParams } from 'react-router';
import { buildLinkToValintaryhmaPage } from '@/lib/appLinks';

export const ValintaryhmaLink = ({
  hakuOid,
  valintaryhmaOid,
  children,
  disabled,
  ...props
}: Omit<LinkProps, 'to'> & {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
  hakuOid: string;
  valintaryhmaOid: string;
}) => {
  const [searchParams] = useSearchParams();
  const vrSearchParam = searchParams.get('vrsearch');

  return disabled ? (
    <Box
      className={props.className}
      style={{ paddingLeft: '7px', width: '100%' }}
    >
      {children}
    </Box>
  ) : (
    <Link
      {...props}
      style={{ textDecoration: 'none', paddingLeft: '7px', width: '100%' }}
      to={{
        pathname: buildLinkToValintaryhmaPage({ hakuOid, valintaryhmaOid }),
        search: vrSearchParam
          ? `?${new URLSearchParams({ vrsearch: vrSearchParam })}`
          : undefined,
      }}
    >
      {children}
    </Link>
  );
};
