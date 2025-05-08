import { FileDownloadButton } from '@/components/file-download-button';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useTranslations } from '@/lib/localization/useTranslations';
import { getValintakoeExcel } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { OphButton } from '@opetushallitus/oph-design-system';

export const ValintakoekutsutExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
  component = OphButton,
}: KoutaOidParams & {
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
