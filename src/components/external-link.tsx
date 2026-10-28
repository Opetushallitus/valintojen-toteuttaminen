import { OphLink } from '@opetushallitus/oph-design-system';

export type ExternalLinkProps = {
  name: string;
  // Absoluuttinen osoite, ks. lib/externalLinks.ts
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
  if (!href.startsWith('http')) {
    console.warn(`ExternalLink: osoite "${href}" ei ole absoluuttinen`);
  }

  return (
    <OphLink
      target="_blank"
      iconVisible={noIcon == null ? true : !noIcon}
      href={href}
      title={title ?? ''}
      underline={underline}
    >
      {name}
    </OphLink>
  );
};
