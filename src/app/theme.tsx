'use client';
import * as React from 'react';
import { MUI_NEXTJS_OVERRIDES } from '@opetushallitus/oph-design-system/next/theme';
import { createStyled } from '@mui/system';
import { deepmerge } from '@mui/utils';

import { createODSTheme } from '@opetushallitus/oph-design-system/theme';

import { colors } from '@opetushallitus/oph-design-system';

export { colors };

const theme = createODSTheme({
  variant: 'oph',
  overrides: deepmerge(MUI_NEXTJS_OVERRIDES, {
    components: {
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

export const styled = createStyled({ defaultTheme: theme });

export default theme;
