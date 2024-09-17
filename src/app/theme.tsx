'use client';
import { ophColors } from '@opetushallitus/oph-design-system';
import { styled as muiStyled } from '@mui/material/styles';

export { ophColors } from '@opetushallitus/oph-design-system';

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  !propName.startsWith('$');

export const styled: typeof muiStyled = (
  tag: Parameters<typeof muiStyled>[0],
  options: Parameters<typeof muiStyled>[1] = {},
) => {
  return muiStyled(tag, {
    shouldForwardProp: withTransientProps,
    ...options,
  });
};

export const THEME_OVERRIDES = {
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderColor: ophColors.grey800,
          borderRadius: '2px',
          height: '48px',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          '&:hover, &:focus': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
};
