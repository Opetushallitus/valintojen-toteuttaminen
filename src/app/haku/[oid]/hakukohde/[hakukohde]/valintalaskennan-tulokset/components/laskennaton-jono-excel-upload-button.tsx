import { FileSelectButton } from '@/app/components/file-select-button';
import { hideModal, showModal } from '@/app/components/global-modal';
import { GlobalSpinnerModal } from '@/app/components/global-spinner-modal';
import useToaster from '@/app/hooks/useToaster';
import { useTranslations } from '@/app/hooks/useTranslations';
import { saveValintatapajonoTulosExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'remeda';
import { refetchLaskennanTulokset } from '../lib/refetchLaskennanTulokset';

const useJonoExcelUploadMutation = ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintatapajonoOid: string;
}) => {
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      showModal(GlobalSpinnerModal, {
        title: t(
          'valintalaskennan-tulokset.tuodaan-tuloksia-taulukkolaskennasta',
        ),
      });
      return await saveValintatapajonoTulosExcel({
        hakuOid,
        hakukohdeOid,
        valintatapajonoOid,
        file,
      });
    },
    onError: (error) => {
      hideModal(GlobalSpinnerModal);
      addToast({
        key: 'upload-valintatapajono-excel-error',
        message:
          t('valintalaskennan-tulokset.virhe-tuo-taulukkolaskennasta') +
          (isEmpty(error?.message) ? '.' : `: \n${error.message}`),
        type: 'error',
      });
    },
    onSuccess: () => {
      hideModal(GlobalSpinnerModal);
      // Ladataan muuttuneet laskennan tulokset
      refetchLaskennanTulokset({ queryClient, hakukohdeOid });
      addToast({
        key: 'upload-valintatapajono-excel-success',
        message: 'valintalaskennan-tulokset.tuo-taulukkolaskennasta-onnistui',
        type: 'success',
      });
    },
  });
};

export const LaskennatonJonoExcelUploadButton = ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintatapajonoOid: string;
}) => {
  const { t } = useTranslations();
  const { mutate } = useJonoExcelUploadMutation({
    hakuOid,
    hakukohdeOid,
    valintatapajonoOid,
  });
  return (
    <FileSelectButton
      onFileSelect={(file) => {
        mutate({ file });
      }}
    >
      {t('yleinen.tuo-taulukkolaskennasta')}
    </FileSelectButton>
  );
};
