import { FileDownloadButton } from '@/components/file-download-button';
import { useTranslations } from '@/lib/localization/useTranslations';
import { getSijoittelunTulosExcel } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';

export const SijoittelunTuloksetExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
  sijoitteluajoId,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  sijoitteluajoId: string;
}) => {
  const { t } = useTranslations();

  return (
    <FileDownloadButton
      variant="contained"
      defaultFileName={`sijoitteluntulos-${hakukohdeOid}.xlsx`}
      errorKey="get-sijoittelun-tulos-excel"
      errorMessage="sijoittelun-tulokset.virhe-vie-taulukkolaskentaan"
      getFile={() =>
        getSijoittelunTulosExcel({ hakuOid, hakukohdeOid, sijoitteluajoId })
      }
    >
      {t('yleinen.vie-taulukkolaskentaan')}
    </FileDownloadButton>
  );
};
