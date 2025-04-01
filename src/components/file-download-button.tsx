import { FileResult } from '@/lib/http-client';
import useToaster from '@/hooks/useToaster';
import { useFileDownloadMutation } from '../hooks/useFileDownloadMutation';
import { FileDownloadOutlined } from '@mui/icons-material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ButtonProps } from '@mui/material';

type FileDownloadProps = {
  component?: typeof OphButton;
  icon?: React.ReactNode;
  getFile: () => Promise<FileResult>;
  children: React.ReactNode;
  defaultFileName: string;
  errorKey: string;
  errorMessage: string;
} & Omit<ButtonProps, 'onClick' | 'loading' | 'loadingPosition'>;

export function FileDownloadButton({
  defaultFileName,
  children,
  getFile,
  errorKey,
  errorMessage,
  startIcon,
  component,
  ...props
}: FileDownloadProps) {
  const { addToast } = useToaster();
  const mutation = useFileDownloadMutation({
    onError: () => {
      addToast({
        key: errorKey,
        message: errorMessage,
        type: 'error',
      });
    },
    getFile,
    defaultFileName,
  });

  const ButtonComponent = component ?? OphButton;

  return (
    <ButtonComponent
      startIcon={startIcon ?? <FileDownloadOutlined />}
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
      {...props}
    >
      {children}
    </ButtonComponent>
  );
}
