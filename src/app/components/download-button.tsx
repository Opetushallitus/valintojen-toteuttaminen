import { ButtonProps } from '@mui/material';
import { UseMutationResult } from '@tanstack/react-query';
import { SpinnerIcon } from './spinner-icon';
import { Button } from '@opetushallitus/oph-design-system';

export const DownloadButton = ({
  mutation,
  startIcon,
  disabled,
  children,
  spinnerStyles,
  Component = Button,
}: Pick<ButtonProps, 'startIcon' | 'disabled' | 'children'> & {
  mutation: UseMutationResult<void, Error, void>;
  spinnerStyles?: React.CSSProperties;
  Component: React.ComponentType<
    Pick<ButtonProps, 'startIcon' | 'disabled' | 'onClick' | 'children'>
  >;
}) => {
  const { isPending, mutate } = mutation;
  return (
    <Component
      startIcon={
        isPending ? (
          <SpinnerIcon sx={{ color: 'inherit', ...spinnerStyles }} />
        ) : (
          startIcon
        )
      }
      disabled={disabled || isPending}
      onClick={() => mutate()}
    >
      {children}
    </Component>
  );
};
