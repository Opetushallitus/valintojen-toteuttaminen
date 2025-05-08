import { FileDownloadButton } from '@/components/file-download-button';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useTranslations } from '@/lib/localization/useTranslations';
import { getPistesyottoExcel } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';

export const PistesyottoExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) => {
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
