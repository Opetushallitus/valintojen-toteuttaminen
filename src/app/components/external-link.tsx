import { DOMAIN } from '@/app/lib/configuration';
import { OpenInNew } from '@mui/icons-material';
import { Link } from '@mui/material';

export type ExternalLinkProps = {
  name: string;
  href: string;
  noIcon?: boolean;
};

export const ExternalLink = ({ name, href, noIcon }: ExternalLinkProps) => (
  <Link target="_blank" href={`${DOMAIN}/${href}`}>
    {name}{' '}
    {!noIcon && (
      <OpenInNew
        sx={{ verticalAlign: 'middle', width: '20px', height: '20px' }}
      />
    )}
  </Link>
);
