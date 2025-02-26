import { ophColors, styled } from '@/app/lib/theme';

export const NAV_LIST_SELECTED_ITEM_CLASS = 'navigation-list--item-selected';

export const NavigationList = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  textAlign: 'left',
  overflowY: 'auto',
  height: 'auto',
  paddingRight: theme.spacing(0.5),
  gap: theme.spacing(0.5),
  '& > a': {
    display: 'block',
    padding: theme.spacing(1),
    cursor: 'pointer',
    color: ophColors.blue2,
    textDecoration: 'none',
    borderRadius: '0',
    '&:nth-of-type(even)': {
      backgroundColor: ophColors.grey50,
    },
    [`&:hover, &.${NAV_LIST_SELECTED_ITEM_CLASS}`]: {
      backgroundColor: ophColors.lightBlue2,
    },
    '&:focus-visible': {
      outlineOffset: '-2px',
    },
  },
}));
