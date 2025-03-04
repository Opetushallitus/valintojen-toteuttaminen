import { DOMAIN } from '@/lib/configuration';
import { OphLink } from '@opetushallitus/oph-design-system';

export type ExternalLinkProps = {
  name: string;
  href: string;
  noIcon?: boolean;
};

export const ExternalLink = ({ name, href, noIcon }: ExternalLinkProps) => {
  return (
    <OphLink
      iconVisible={noIcon == null ? true : !noIcon}
      href={`${DOMAIN}/${href}`}
    >
      {name}
    </OphLink>
  );
};
