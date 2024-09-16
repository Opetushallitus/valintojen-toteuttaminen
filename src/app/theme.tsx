'use client';
import * as React from 'react';
import { MUI_NEXTJS_OVERRIDES } from '@opetushallitus/oph-design-system/next/theme';
import { createStyled } from '@mui/system';
import { deepmerge } from '@mui/utils';

import { createODSTheme } from '@opetushallitus/oph-design-system/theme';

import { colors } from '@opetushallitus/oph-design-system';
import { Theme } from '@mui/material';

export { colors };

const theme = createODSTheme({
  variant: 'oph',
  overrides: deepmerge(MUI_NEXTJS_OVERRIDES, {
    components: {
      MuiToggleButton: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            paddingTop: 0,
            paddingBottom: 0,
            color: colors.grey900,
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
            borderRadius: '2px',
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: colors.white,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: colors.white,
              },
              '&:active, &.Mui-focusVisible': {
                backgroundColor: theme.palette.primary.dark,
              },
            },
            '&:hover': {
              backgroundColor: colors.white,
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
            borderColor: colors.grey800,
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
      MuiFormLabel: {
        styleOverrides: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          root: ({ theme }: { theme: any }) => ({
            ...theme.typography.label,
            color: colors.black,
            '&.Mui-focused': {
              color: colors.black,
            },
          }),
        },
      },
    },
  }),
});

// MUI:sta (Emotionista) puuttuu styled-componentsin .attrs
// Tällä voi asettaa oletus-propsit ilman, että tarvii luoda välikomponenttia
export function withDefaultProps<P>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<P>,
  displayName = 'ComponentWithDefaultProps',
) {
  const ComponentWithDefaultProps = React.forwardRef<
    React.ComponentRef<React.ComponentType<P>>,
    P
  >((props, ref) => <Component {...defaultProps} {...props} ref={ref} />);

  ComponentWithDefaultProps.displayName = displayName;
  return ComponentWithDefaultProps;
}

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  !propName.startsWith('$');

const createOphStyled = <T extends Theme>({
  theme,
  shouldForwardProp,
}: {
  theme: T;
  shouldForwardProp: (prop: string) => boolean;
}) => {
  const themeStyled = createStyled<T>({
    defaultTheme: theme,
  });

  const styled: typeof themeStyled = (
    tag: Parameters<typeof themeStyled>[0],
    options: Parameters<typeof themeStyled>[1],
  ) => {
    return themeStyled(tag, {
      ...options,
      shouldForwardProp,
    });
  };
  return styled;
};

export const styled = createOphStyled({
  theme,
  shouldForwardProp: withTransientProps,
});

export default theme;
