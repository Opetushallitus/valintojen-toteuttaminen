import { useConfiguration } from '@/hooks/useConfiguration';
import { OphLink } from '@opetushallitus/oph-design-system';
import { Link } from 'react-router';

export type ExternalLinkProps = {
  name: string;
  href: string;
  noIcon?: boolean;
  title?: string;
  // Tekstin sisällä oleva linkki pitää erottaa ympäröivästä tekstistä muutenkin kuin värillä
  underline?: 'hover' | 'always';
};

export const ExternalLink = ({
  name,
  href,
  noIcon,
  title,
  underline,
}: ExternalLinkProps) => {
  const { configuration } = useConfiguration();
  const isAbsoluteLink = href.startsWith('http');
  const to = isAbsoluteLink ? href : `${configuration?.domain}/${href}`;

  return (
    <OphLink
      component={Link}
      target="_blank"
      iconVisible={noIcon == null ? true : !noIcon}
      to={to}
      title={title ?? ''}
      underline={underline}
    >
      {name}
    </OphLink>
  );
};
