import { ButtonProps } from '@mui/material';
import { UseMutationResult } from '@tanstack/react-query';
import { SpinnerIcon } from './spinner-icon';
import { OphButton } from '@opetushallitus/oph-design-system';
import { FileDownloadOutlined } from '@mui/icons-material';

export const DownloadButton = ({
  mutation,
  startIcon = <FileDownloadOutlined />,
  disabled,
  children,
  spinner = <SpinnerIcon />,
  Component = OphButton,
}: Pick<ButtonProps, 'startIcon' | 'disabled' | 'children'> & {
  mutation: UseMutationResult<void, Error, void>;
  spinner?: React.ReactNode;
  Component?: React.ComponentType<
    Pick<ButtonProps, 'startIcon' | 'disabled' | 'onClick' | 'children'>
  >;
}) => {
  const { isPending, mutate } = mutation;
  return (
    <Component
      startIcon={isPending ? spinner : startIcon}
      disabled={disabled || isPending}
      onClick={() => mutate()}
    >
      {children}
    </Component>
  );
};
