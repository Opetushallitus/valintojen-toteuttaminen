import { FileDownloadButton } from '@/app/components/file-download-button';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getPistesyottoExcel } from '@/app/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';

export const PistesyottoExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { t } = useTranslations();

  return (
    <FileDownloadButton
      defaultFileName="pistesyotto.xls"
      errorKey="get-pistesyotto-excel"
      errorMessage="pistesyotto.virhe-vie-taulukkolaskentaan"
      getFile={() => getPistesyottoExcel({ hakuOid, hakukohdeOid })}
    >
      {t('yleinen.vie-taulukkolaskentaan')}
    </FileDownloadButton>
  );
};
