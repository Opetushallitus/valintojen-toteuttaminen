import { DEFAULT_BOX_BORDER, ophColors, styled } from '@/lib/theme';

// Välilehtirivi: välilehdet rinnakkain, ja kapealla näytöllä ne rivittyvät. Rivin alla on vaakaviiva.
// Navigaatiovälilehdille annetaan as="nav", tablist-välilehdille role="tablist".
export const TabRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1),
  flexWrap: 'wrap',
  borderBottom: DEFAULT_BOX_BORDER,
}));

// Välilehden tyyli: sininen teksti, ja aktiivisella ja hover-tilassa alleviivaus. Alleviivaus tehdään
// reunaviivalla, joka on muulloin läpinäkyvä, jottei välilehden koko muutu. Aktiivinen välilehti
// tunnistetaan ARIA-attribuutista: navigaatiolinkeissä aria-current ja tablist-välilehdissä aria-selected.
const StyledTab = styled('button')(({ theme }) => ({
  // Nollataan painikkeen oletustyylit
  ...theme.typography.body1,
  background: 'none',
  border: 'none',
  margin: 0,
  padding: 0,
  cursor: 'pointer',
  color: ophColors.blue2,
  textDecoration: 'none',
  borderBottom: '3px solid transparent',
  '&:hover, &[aria-current="page"], &[aria-selected="true"]': {
    color: ophColors.blue2,
    borderColor: ophColors.blue2,
  },
  '&:focus-visible': {
    outline: `2px solid ${ophColors.blue2}`,
    outlineOffset: '3px',
  },
}));

type TabProps<C extends React.ElementType> = {
  component?: C;
} & Omit<React.ComponentPropsWithRef<C>, 'component'>;

// Välilehti, joka on oletuksena painike. Navigaatiovälilehdille annetaan linkkikomponentti
// component-propsina, jolloin sen omat propsit tyypitetään oikein (styledin as-props ei tee sitä).
export const Tab = <C extends React.ElementType = 'button'>({
  component,
  ...props
}: TabProps<C>) => <StyledTab as={component ?? 'button'} {...props} />;
