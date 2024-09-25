import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { OphButton } from '@opetushallitus/oph-design-system';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pisteTuloksetOptions } from '../hooks/usePisteTulokset';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { PistesyottoTuontiError } from './pistesyotto-excel-upload-error';
import { FileUploadOutlined } from '@mui/icons-material';
import useToaster from '@/app/hooks/useToaster';
import { putPistesyottoExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { OphApiError } from '@/app/lib/common';

const refetchPisteTulokset = ({
  queryClient,
  hakuOid,
  hakukohdeOid,
}: {
  queryClient: QueryClient;
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const options = pisteTuloksetOptions({ hakuOid, hakukohdeOid });
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};

const useExcelUploadMutation = ({
  hakuOid,
  hakukohdeOid,
  showErrorModal,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  showErrorModal: (e: Error) => void;
}) => {
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      return await putPistesyottoExcel({
        hakuOid,
        hakukohdeOid,
        excelFile: file,
      });
    },
    onError: (e) => {
      showErrorModal(e);
      if (e instanceof OphApiError) {
        // Onnistui osittain -> noudetaan pistetiedot
        refetchPisteTulokset({ queryClient, hakuOid, hakukohdeOid });
      }
    },
    onSuccess: () => {
      addToast({
        key: 'put-pistesyotto-excel-success',
        message: 'pistesyotto.tuo-valintalaskennasta-onnistui',
        type: 'success',
      });

      // Ladataan muuttuneet pistetulokset
      refetchPisteTulokset({ queryClient, hakuOid, hakukohdeOid });
    },
  });
};

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
            // Tyhjennetään kentän arvo, jotta onChange kutsutaan myös seuraavalla kerralla, vaikka valitaan sama tiedosto
            innerRef.current.value = '';
          }
        }}
      />
    );
  },
);

export const ExcelUploadButton = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { t, i18n } = useTranslation();
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const { mutate, isPending } = useExcelUploadMutation({
    hakuOid,
    hakukohdeOid,
    showErrorModal: (e) => setUploadError(e),
  });

  const fileSelectorRef = useRef<FileSelectorRef>(null);

  return (
    <>
      <FileSelector
        ref={fileSelectorRef}
        onFileSelect={(file) => mutate({ file })}
      />
      <OphModalDialog
        title={
          uploadError?.message && i18n.exists(uploadError.message)
            ? t(uploadError.message)
            : t('pistesyotto.virhe-tuo-taulukkolaskennasta')
        }
        fullWidth={true}
        maxWidth="lg"
        open={Boolean(uploadError)}
        onClose={() => setUploadError(null)}
        actions={
          <OphButton variant="outlined" onClick={() => setUploadError(null)}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        {uploadError && <PistesyottoTuontiError error={uploadError} />}
      </OphModalDialog>
      <OphModalDialog
        titleAlign="center"
        maxWidth="md"
        open={isPending}
        title={t('pistesyotto.tuodaan-pistetietoja-taulukkolaskennasta')}
      >
        <FullClientSpinner />
      </OphModalDialog>
      <OphButton
        disabled={isPending}
        startIcon={<FileUploadOutlined />}
        onClick={() => {
          fileSelectorRef?.current?.openFileSelector();
        }}
      >
        {t('yleinen.tuo-taulukkolaskennasta')}
      </OphButton>
    </>
  );
};
