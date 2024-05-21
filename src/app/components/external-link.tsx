import { DOMAIN } from '@/app/lib/configuration';
import { Link } from '@mui/material';

export type ExternalLinkProps = {
  name: string;
  href: string;
};

export const ExternalLink = ({ name, href }: ExternalLinkProps) => (
  <Link target="_blank" href={`${DOMAIN}/${href}}`}>
    {name}
  </Link>
);
