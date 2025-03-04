import { FileDownloadButton } from '@/app/components/file-download-button';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getSijoittelunTulosExcel } from '@/app/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';

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
