import { DownloadButton } from '@/app/components/download-button';
import useToaster from '@/app/hooks/useToaster';
import { useTranslations } from '@/app/hooks/useTranslations';
import { downloadBlob } from '@/app/lib/common';
import { getPistesyottoExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { useMutation } from '@tanstack/react-query';

const useExcelDownloadMutation = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getPistesyottoExcel({
        hakuOid,
        hakukohdeOid,
      });
      downloadBlob(fileName ?? 'pistesyotto.xls', blob);
    },
    onError: (e) => {
      addToast({
        key: 'get-pistesyotto-excel',
        message: 'pistesyotto.virhe-vie-taulukkolaskentaan',
        type: 'error',
      });
      console.error(e);
    },
  });
};

export const ExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { t } = useTranslations();

  const excelMutation = useExcelDownloadMutation({
    hakuOid,
    hakukohdeOid,
  });

  return (
    <DownloadButton mutation={excelMutation}>
      {t('yleinen.vie-taulukkolaskentaan')}
    </DownloadButton>
  );
};
