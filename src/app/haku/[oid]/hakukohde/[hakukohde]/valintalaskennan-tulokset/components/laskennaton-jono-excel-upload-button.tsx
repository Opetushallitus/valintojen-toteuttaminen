import { FileSelectButton } from '@/components/file-select-button';
import { hideModal, showModal } from '@/components/modals/global-modal';
import { SpinnerGlobalModal } from '@/components/modals/spinner-global-modal';
import useToaster from '@/hooks/useToaster';
import { useTranslations } from '@/lib/localization/useTranslations';
import { saveValintatapajonoTulosExcel } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'remeda';
import { refetchLaskennanTulokset } from '../lib/refetchLaskennanTulokset';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';

const useJonoExcelUploadMutation = ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
}: KoutaOidParams & {
  valintatapajonoOid: string;
}) => {
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      showModal(SpinnerGlobalModal, {
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
      hideModal(SpinnerGlobalModal);
      addToast({
        key: 'upload-valintatapajono-excel-error',
        message:
          t('valintalaskennan-tulokset.virhe-tuo-taulukkolaskennasta') +
          (isEmpty(error?.message) ? '.' : `: \n${error.message}`),
        type: 'error',
      });
    },
    onSuccess: () => {
      hideModal(SpinnerGlobalModal);
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
}: KoutaOidParams & {
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
