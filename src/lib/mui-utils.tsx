import { ComponentRef, ComponentType, forwardRef } from 'react';

// MUI:sta (Emotionista) puuttuu styled-componentsin .attrs
// Tällä voi asettaa oletus-propsit ilman, että tarvii luoda välikomponenttia
/* eslint-disable @typescript-eslint/no-explicit-any */
export function withDefaultProps<P extends React.ComponentPropsWithoutRef<any>>(
  Component: ComponentType<P>,
  defaultProps: Partial<P>,
  displayName: string = 'ComponentWithDefaultProps',
) {
  const ComponentWithDefaultProps = forwardRef<
    ComponentRef<ComponentType<P>>,
    P
  >((props, ref) => <Component {...defaultProps} {...props} ref={ref} />);

  ComponentWithDefaultProps.displayName = displayName;
  return ComponentWithDefaultProps;
}
