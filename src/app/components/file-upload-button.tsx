import { FileUploadOutlined } from '@mui/icons-material';
import { OphButton } from '@opetushallitus/oph-design-system';
import React, { forwardRef, useRef, useImperativeHandle } from 'react';

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
          const files = event.currentTarget.files;
          if (files) {
            onFileSelect(files[0]);
          }
          if (innerRef.current) {
            innerRef.current.value = '';
          }
        }}
      />
    );
  },
);

export const FileUploadButton = ({
  isUploading,
  buttonText,
  onFileSelect,
}: {
  isUploading: boolean;
  onFileSelect: (file: File) => void;
  buttonText: string;
}) => {
  const fileSelectorRef = useRef<FileSelectorRef>(null);

  return (
    <>
      <FileSelector ref={fileSelectorRef} onFileSelect={onFileSelect} />
      <OphButton
        disabled={isUploading}
        startIcon={<FileUploadOutlined />}
        onClick={() => {
          fileSelectorRef?.current?.openFileSelector();
        }}
      >
        {buttonText}
      </OphButton>
    </>
  );
};
