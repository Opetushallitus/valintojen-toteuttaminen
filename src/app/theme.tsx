'use client';
import * as React from 'react';
import { MUI_NEXTJS_OVERRIDES } from '@opetushallitus/oph-design-system/next/theme';
import { createStyled } from '@mui/system';

import { createODSTheme } from '@opetushallitus/oph-design-system/theme';

import { colors } from '@opetushallitus/oph-design-system';

export { colors };

const theme = createODSTheme({
  variant: 'oph',
  overrides: MUI_NEXTJS_OVERRIDES,
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
