import { OphButton } from '@opetushallitus/oph-design-system';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { pisteTuloksetOptions } from '../hooks/usePisteTulokset';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { PistesyottoTuontiError } from './pistesyotto-excel-upload-error';
import { FileUploadOutlined } from '@mui/icons-material';
import useToaster from '@/app/hooks/useToaster';
import { putPistesyottoExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphApiError } from '@/app/lib/common';
import {
  createModal,
  hideModal,
  showModal,
  useOphModalProps,
} from '@/app/components/global-modal';

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

const SpinnerModalDialog = createModal(() => {
  const { open, TransitionProps } = useOphModalProps();
  const { t } = useTranslations();
  return (
    <OphModalDialog
      open={open}
      TransitionProps={TransitionProps}
      title={t('pistesyotto.tuodaan-pistetietoja-taulukkolaskennasta')}
      maxWidth="md"
      titleAlign="center"
    >
      <FullClientSpinner />
    </OphModalDialog>
  );
});

const ErrorModalDialog = createModal(({ error }: { error: Error }) => {
  const modalProps = useOphModalProps();
  const { t, i18n } = useTranslations();
  return (
    <OphModalDialog
      {...modalProps}
      title={
        error?.message && i18n.exists(error.message)
          ? t(error.message)
          : t('pistesyotto.virhe-tuo-taulukkolaskennasta')
      }
      maxWidth="md"
      actions={
        <OphButton variant="outlined" onClick={modalProps.onClose}>
          {t('yleinen.sulje')}
        </OphButton>
      }
    >
      <PistesyottoTuontiError error={error} />
    </OphModalDialog>
  );
});

const useExcelUploadMutation = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      showModal(SpinnerModalDialog);
      return await putPistesyottoExcel({
        hakuOid,
        hakukohdeOid,
        excelFile: file,
      });
    },
    onError: (error) => {
      hideModal(SpinnerModalDialog);
      // Tuonti onnistui osittain -> ladataan muuttuneet pistetulokset
      if (error instanceof OphApiError) {
        refetchPisteTulokset({ queryClient, hakuOid, hakukohdeOid });
      }
      showModal(ErrorModalDialog, { error });
    },
    onSuccess: () => {
      // Ladataan muuttuneet pistetulokset
      refetchPisteTulokset({ queryClient, hakuOid, hakukohdeOid });
      hideModal(SpinnerModalDialog);
      addToast({
        key: 'put-pistesyotto-excel-success',
        message: 'pistesyotto.tuo-valintalaskennasta-onnistui',
        type: 'success',
      });
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
  const { t } = useTranslations();

  const { mutate, isPending } = useExcelUploadMutation({
    hakuOid,
    hakukohdeOid,
  });

  const fileSelectorRef = useRef<FileSelectorRef>(null);

  return (
    <>
      <FileSelector
        ref={fileSelectorRef}
        onFileSelect={(file) => mutate({ file })}
      />
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
