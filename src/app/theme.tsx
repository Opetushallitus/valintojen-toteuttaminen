'use client';
import * as React from 'react';
import { MUI_NEXTJS_OVERRIDES } from '@opetushallitus/oph-design-system/next/theme';

import { createODSTheme } from '@opetushallitus/oph-design-system/theme';
import { deepmerge } from '@mui/utils';

import { colors } from '@opetushallitus/oph-design-system';

export { colors };

const theme = createODSTheme({
  variant: 'oph',
  overrides: deepmerge(MUI_NEXTJS_OVERRIDES, {
    palette: {
      background: {
        default: colors.grey50,
      },
    },
    Typography: {
      color: colors.grey900,
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

export default theme;
