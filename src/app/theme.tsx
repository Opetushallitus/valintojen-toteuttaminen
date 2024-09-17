'use client';
import { ophColors } from '@opetushallitus/oph-design-system';

export { ophColors } from '@opetushallitus/oph-design-system';

import { styled as muiStyled } from '@mui/material/styles';

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
    MuiFormLabel: {
      styleOverrides: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        root: ({ theme }: any) => ({
          ...theme.typography.label,
        }),
      },
    },
    MuiToggleButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        root: ({ theme }: any) => ({
          paddingTop: 0,
          paddingBottom: 0,
          color: ophColors.grey900,
          borderColor: theme.palette.primary.main,
          borderWidth: '2px',
          borderRadius: '2px',
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: ophColors.white,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: ophColors.white,
            },
            '&:active, &.Mui-focusVisible': {
              backgroundColor: theme.palette.primary.dark,
            },
          },
          '&:hover': {
            backgroundColor: ophColors.white,
            borderColor: theme.palette.primary.light,
            color: theme.palette.primary.main,
          },
          '&.Mui-disabled': {},
        }),
      },
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
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
