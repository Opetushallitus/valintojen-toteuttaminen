import { FileResult } from '@/app/lib/http-client';
import useToaster from '@/app/hooks/useToaster';
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
} & Omit<ButtonProps, 'onClick' | 'loading'>;

export function FileDownloadButton({
  defaultFileName,
  children,
  getFile,
  errorKey,
  errorMessage,
  startIcon,
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

  return (
    <OphButton
      startIcon={startIcon ?? <FileDownloadOutlined />}
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
      {...props}
    >
      {children}
    </OphButton>
  );
}
