import { Link, type LinkProps, type To } from 'react-router';

type BlockerLinkProps = Omit<LinkProps, 'to'> & {
  to?: To;
  /** MUI:n LinkComponent/component-propit välittävät osoitteen href-propissa */
  href?: To;
  useBlank?: boolean;
  children: React.ReactNode;
};

/**
 * Linkki, jonka navigointi voidaan estää, kun lomakkeella on tallentamattomia
 * muutoksia. Varsinainen esto tapahtuu react-routerin useBlocker-hookilla
 * (ks. useNavigationBlockerWithWindowEvents), joka estää kaikki
 * router-navigoinnit ja näyttää vahvistusmodaalin.
 */
export const BlockerLink = ({
  children,
  useBlank = false,
  to,
  href,
  ...props
}: BlockerLinkProps) => {
  return (
    <Link
      {...props}
      to={to ?? href ?? ''}
      target={useBlank ? '_blank' : '_self'}
    >
      {children}
    </Link>
  );
};

export const BlockerLinkWithBlank = ({
  children,
  ...props
}: BlockerLinkProps) => {
  return (
    <BlockerLink {...props} useBlank={true}>
      {children}
    </BlockerLink>
  );
};
