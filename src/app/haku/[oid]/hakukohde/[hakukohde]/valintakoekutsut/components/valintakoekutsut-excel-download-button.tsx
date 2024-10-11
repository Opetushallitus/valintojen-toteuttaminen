import { DownloadButton } from '@/app/components/download-button';
import useToaster from '@/app/hooks/useToaster';
import { useTranslations } from '@/app/hooks/useTranslations';
import { downloadBlob } from '@/app/lib/common';
import { ValintakoekutsutDownloadProps } from '@/app/lib/types/valintakoekutsut-types';
import { getValintakoeExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { useMutation } from '@tanstack/react-query';

const useExcelDownloadMutation = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
}: ValintakoekutsutDownloadProps) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getValintakoeExcel({
        hakuOid,
        hakukohdeOid,
        valintakoeTunniste,
        hakemusOids: selection && Array.from(selection),
      });
      downloadBlob(fileName ?? 'valintakoekutsut.xls', blob);
    },
    onError: (e) => {
      addToast({
        key: 'get-valintakoe-excel',
        message: 'valintakoekutsut.virhe-vie-taulukkolaskentaan',
        type: 'error',
      });
      console.error(e);
    },
  });
};

export const ValintakoekutsutExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
  Component,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintakoeTunniste: Array<string>;
  selection?: Set<string>;
  Component?: React.ComponentType;
}) => {
  const { t } = useTranslations();

  const excelMutation = useExcelDownloadMutation({
    hakuOid,
    hakukohdeOid,
    valintakoeTunniste,
    selection,
  });

  return (
    <DownloadButton
      Component={Component}
      disabled={selection && selection.size === 0}
      mutation={excelMutation}
    >
      {t('yleinen.vie-taulukkolaskentaan')}
    </DownloadButton>
  );
};
