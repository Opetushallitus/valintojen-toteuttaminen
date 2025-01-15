import { ButtonProps } from '@mui/material';
import { SpinnerIcon } from './spinner-icon';
import { OphButton } from '@opetushallitus/oph-design-system';
import { FileDownloadOutlined } from '@mui/icons-material';

export const DownloadButton = ({
  startIcon = <FileDownloadOutlined />,
  disabled,
  children,
  spinner = <SpinnerIcon />,
  Component = OphButton,
  isLoading = false,
  onClick,
}: Pick<ButtonProps, 'startIcon' | 'disabled' | 'children' | 'onClick'> & {
  spinner?: React.ReactNode;
  isLoading: boolean;
  Component?: React.ComponentType<
    Pick<ButtonProps, 'startIcon' | 'disabled' | 'onClick' | 'children'>
  >;
}) => {
  return (
    <Component
      startIcon={isLoading ? spinner : startIcon}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};
