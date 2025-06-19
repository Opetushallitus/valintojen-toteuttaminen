import { OphButton } from '@opetushallitus/oph-design-system';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useToaster from '@/hooks/useToaster';
import { savePistesyottoExcel } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { OphModal } from '@/components/modals/oph-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { OphApiError } from '@/lib/common';
import {
  createModal,
  hideModal,
  showModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { SpinnerGlobalModal } from '@/components/modals/spinner-global-modal';
import { FileSelectButton } from '@/components/file-select-button';
import { ErrorTable } from '@/components/error-table';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { refetchPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';

const ErrorModalDialog = createModal(({ error }: { error: Error }) => {
  const modalProps = useOphModalProps();
  const { t } = useTranslations();
  return (
    <OphModal
      {...modalProps}
      title={
        error?.message
          ? t({
              key: error.message,
              defaultValue: t('pistesyotto.virhe-tuo-taulukkolaskennasta'),
            })
          : t('pistesyotto.virhe-tuo-taulukkolaskennasta')
      }
      maxWidth="md"
      actions={
        <OphButton variant="outlined" onClick={modalProps.onClose}>
          {t('yleinen.sulje')}
        </OphButton>
      }
    >
      <ErrorTable
        error={error}
        oidHeader="pistesyotto.tuonti-tulos-taulukko.hakemus-oid"
      />
    </OphModal>
  );
});

const useExcelUploadMutation = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      showModal(SpinnerGlobalModal, {
        title: t('pistesyotto.tuodaan-pistetietoja-taulukkolaskennasta'),
      });
      return await savePistesyottoExcel({
        hakuOid,
        hakukohdeOid,
        excelFile: file,
      });
    },
    onError: (error) => {
      hideModal(SpinnerGlobalModal);
      // Tuonti onnistui osittain -> ladataan muuttuneet pistetulokset
      if (error instanceof OphApiError) {
        refetchPisteetForHakukohde(queryClient, {
          hakuOid,
          hakukohdeOid,
        });
      }
      showModal(ErrorModalDialog, { error });
    },
    onSuccess: () => {
      // Ladataan muuttuneet pistetulokset
      refetchPisteetForHakukohde(queryClient, {
        hakuOid,
        hakukohdeOid,
      });
      hideModal(SpinnerGlobalModal);
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
}: KoutaOidParams) => {
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
