import { useConfiguration } from '@/hooks/useConfiguration';
import { OphLink } from '@opetushallitus/oph-design-system';
import { Link } from 'react-router';

export type ExternalLinkProps = {
  name: string;
  href: string;
  noIcon?: boolean;
  title?: string;
};

export const ExternalLink = ({
  name,
  href,
  noIcon,
  title,
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
    >
      {name}
    </OphLink>
  );
};
