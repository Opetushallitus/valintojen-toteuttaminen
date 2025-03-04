import { useMutation } from '@tanstack/react-query';
import { downloadBlob } from '@/lib/common';
import { FileResult } from '@/lib/http-client';

export function useFileDownloadMutation({
  onError,
  getFile,
  defaultFileName,
}: {
  onError: (e: Error) => void;
  getFile: () => Promise<FileResult>;
  defaultFileName: string;
}) {
  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getFile();
      downloadBlob(fileName ?? defaultFileName, blob);
    },
    onError: (e) => {
      onError(e);
      console.error(e);
    },
  });
}
