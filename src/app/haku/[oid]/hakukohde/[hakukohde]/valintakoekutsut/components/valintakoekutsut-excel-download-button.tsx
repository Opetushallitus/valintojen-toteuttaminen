import { FileDownloadButton } from '@/app/components/file-download-button';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getValintakoeExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { OphButton } from '@opetushallitus/oph-design-system';

export const ValintakoekutsutExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
  component = OphButton,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintakoeTunniste: Array<string>;
  selection?: Set<string>;
  component?: typeof OphButton;
}) => {
  const { t } = useTranslations();

  return (
    <FileDownloadButton
      component={component}
      disabled={selection && selection.size === 0}
      defaultFileName="valintakoekutsut.xls"
      errorKey="get-valintakoe-excel-error"
      errorMessage="valintakoekutsut.virhe-vie-taulukkolaskentaan"
      getFile={() =>
        getValintakoeExcel({
          hakuOid,
          hakukohdeOid,
          valintakoeTunniste,
          hakemusOids: selection && Array.from(selection),
        })
      }
    >
      {t('yleinen.vie-taulukkolaskentaan')}
    </FileDownloadButton>
  );
};
