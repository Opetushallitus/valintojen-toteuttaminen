import { CSSObject, Theme } from '@mui/material/styles';
import { ophColors } from '@/lib/theme';

// Välilehtirivi: välilehdet rinnakkain, ja kapealla näytöllä ne rivittyvät
export const tabRowStyles = (theme: Theme): CSSObject => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1),
  flexWrap: 'wrap',
});

// Välilehden tyyli: sininen teksti, ja aktiivisella ja hover-tilassa alleviivaus. Alleviivaus tehdään
// reunaviivalla, joka on muulloin läpinäkyvä, jottei välilehden koko muutu. Aktiivinen välilehti
// tunnistetaan ARIA-attribuutista: navigaatiolinkeissä aria-current ja tablist-välilehdissä aria-selected.
export const TAB_ITEM_STYLES: CSSObject = {
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
};
