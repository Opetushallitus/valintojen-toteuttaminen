import { useConfiguration } from '@/hooks/useConfiguration';
import { OphLink } from '@opetushallitus/oph-design-system';
import { InternalLink } from './internal-link';

export type ExternalLinkProps = {
  name: string;
  href: string;
  noIcon?: boolean;
};

export const ExternalLink = ({ name, href, noIcon }: ExternalLinkProps) => {
  const { configuration } = useConfiguration();
  return (
    <OphLink
      component={InternalLink}
      iconVisible={noIcon == null ? true : !noIcon}
      href={`${configuration?.domain}/${href}`}
    >
      {name}
    </OphLink>
  );
};
