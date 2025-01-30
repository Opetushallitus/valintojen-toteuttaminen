import { OphButton } from '@opetushallitus/oph-design-system';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { pisteTuloksetOptions } from '../hooks/usePisteTulokset';
import { PistesyottoTuontiError } from './pistesyotto-excel-upload-error';
import useToaster from '@/app/hooks/useToaster';
import { savePistesyottoExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphApiError } from '@/app/lib/common';
import {
  createModal,
  hideModal,
  showModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { GlobalSpinnerModal } from '@/app/components/global-spinner-modal';
import { FileSelectButton } from '@/app/components/file-select-button';

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
  const { t } = useTranslations();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      showModal(GlobalSpinnerModal, {
        title: t('pistesyotto.tuodaan-pistetietoja-taulukkolaskennasta'),
      });
      return await savePistesyottoExcel({
        hakuOid,
        hakukohdeOid,
        excelFile: file,
      });
    },
    onError: (error) => {
      hideModal(GlobalSpinnerModal);
      // Tuonti onnistui osittain -> ladataan muuttuneet pistetulokset
      if (error instanceof OphApiError) {
        refetchPisteTulokset({ queryClient, hakuOid, hakukohdeOid });
      }
      showModal(ErrorModalDialog, { error });
    },
    onSuccess: () => {
      // Ladataan muuttuneet pistetulokset
      refetchPisteTulokset({ queryClient, hakuOid, hakukohdeOid });
      hideModal(GlobalSpinnerModal);
      addToast({
        key: 'put-pistesyotto-excel-success',
        message: 'pistesyotto.tuo-taulukkolaskennasta-onnistui',
        type: 'success',
      });
    },
  });
};

export const PistesyottoExcelUploadButton = ({
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

  return (
    <FileSelectButton
      loading={isPending}
      onFileSelect={(file) => mutate({ file })}
    >
      {t('yleinen.tuo-taulukkolaskennasta')}
    </FileSelectButton>
  );
};
