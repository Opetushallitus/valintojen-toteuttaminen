import { useConfiguration } from '@/hooks/useConfiguration';
import { OphLink } from '@opetushallitus/oph-design-system';
import { InternalLink } from './internal-link';

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
  return (
    <OphLink
      component={InternalLink}
      iconVisible={noIcon == null ? true : !noIcon}
      href={`${configuration?.domain}/${href}`}
      title={title ?? ''}
    >
      {name}
    </OphLink>
  );
};
