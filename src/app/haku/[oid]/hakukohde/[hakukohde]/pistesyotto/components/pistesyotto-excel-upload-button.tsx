import { OphButton } from '@opetushallitus/oph-design-system';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { pisteTuloksetOptions } from '../hooks/usePisteTulokset';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { PistesyottoTuontiError } from './pistesyotto-excel-upload-error';
import { FileUploadOutlined } from '@mui/icons-material';
import useToaster from '@/app/hooks/useToaster';
import { putPistesyottoExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import useModalDialog from '@/app/hooks/useModalDialog';

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
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { addToast } = useToaster();

  const { t, i18n } = useTranslation();

  const { showModal, hideModal } = useModalDialog();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      showModal({
        title: t('pistesyotto.tuodaan-pistetietoja-taulukkolaskennasta'),
        titleAlign: 'center',
        maxWidth: 'md',
        children: <FullClientSpinner />,
      });
      return await putPistesyottoExcel({
        hakuOid,
        hakukohdeOid,
        excelFile: file,
      });
    },
    onError: (e) => {
      const onClose = () => {
        refetchPisteTulokset({ queryClient, hakuOid, hakukohdeOid });
        hideModal();
      };
      showModal({
        title:
          e?.message && i18n.exists(e.message)
            ? t(e.message)
            : t('pistesyotto.virhe-tuo-taulukkolaskennasta'),
        children: <PistesyottoTuontiError error={e} />,
        actions: (
          <OphButton variant="outlined" onClick={onClose}>
            {t('yleinen.sulje')}
          </OphButton>
        ),
        onClose,
      });
    },
    onSuccess: () => {
      hideModal();
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
  const { t } = useTranslation();

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
