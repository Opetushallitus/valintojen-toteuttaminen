import { useConfiguration } from '@/hooks/useConfiguration';
import { OphLink } from '@opetushallitus/oph-design-system';
import { BlockerLinkWithBlank } from './blocker-link';

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
      component={BlockerLinkWithBlank}
      iconVisible={noIcon == null ? true : !noIcon}
      href={`${configuration?.domain}/${href}`}
      title={title ?? ''}
      prefetch={false}
    >
      {name}
    </OphLink>
  );
};
