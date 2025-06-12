import { FileUploadOutlined } from '@mui/icons-material';
import { ButtonProps } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { forwardRef, useRef, useImperativeHandle } from 'react';

type FileSelectorRef = { openFileSelector: () => void };
type FileSelectorProps = { onFileSelect: (file: File) => void };

const FileSelector = forwardRef<FileSelectorRef, FileSelectorProps>(
  function renderFileInput({ onFileSelect }, ref) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const innerRef = useRef<HTMLInputElement>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useImperativeHandle(ref, () => {
      return {
        openFileSelector: () => {
          innerRef.current?.click();
        },
      };
    });

    return (
      <input
        ref={innerRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            onFileSelect(file);
          }
          if (innerRef.current) {
            innerRef.current.value = '';
          }
        }}
      />
    );
  },
);

export type FileSelectButtonProps = {
  onFileSelect: (file: File) => void;
} & Omit<ButtonProps, 'onClick'>;

export const FileSelectButton = ({
  children,
  loading,
  onFileSelect,
  ...props
}: FileSelectButtonProps) => {
  const fileSelectorRef = useRef<FileSelectorRef>(null);

  return (
    <>
      <FileSelector ref={fileSelectorRef} onFileSelect={onFileSelect} />
      <OphButton
        loading={loading}
        startIcon={<FileUploadOutlined />}
        onClick={() => {
          fileSelectorRef?.current?.openFileSelector();
        }}
        {...props}
      >
        {children}
      </OphButton>
    </>
  );
};
