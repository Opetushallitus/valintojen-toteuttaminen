import { Box } from '@mui/material';
import { DeselectOutlined, NoteOutlined } from '@mui/icons-material';
import { ActionBar } from '@/components/action-bar';
import {
  GetValintakoeExcelParams,
  getValintakoeOsoitetarrat,
} from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { ValintakoekutsutExcelDownloadButton } from './valintakoekutsut-excel-download-button';
import { FileDownloadButton } from '@/components/file-download-button';
import { useTranslations } from '@/lib/localization/useTranslations';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';

const OsoitetarratDownloadButton = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
}: KoutaOidParams & {
  valintakoeTunniste: string;
  selection: Set<string>;
}) => {
  const { t } = useTranslations();

  return (
    <FileDownloadButton
      component={ActionBar.Button}
      disabled={selection.size === 0}
      startIcon={<NoteOutlined />}
      getFile={() =>
        getValintakoeOsoitetarrat({
          hakuOid,
          hakukohdeOid,
          valintakoeTunniste,
          hakemusOids: Array.from(selection),
        })
      }
      errorKey="get-osoitetarrat-error"
      errorMessage="virhe.osoitetarrat"
      defaultFileName="osoitetarrat.pdf"
    >
      {t('valintakoekutsut.muodosta-osoitetarrat')}
    </FileDownloadButton>
  );
};

export const ValintakoekutsutActionBar = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
  resetSelection,
}: {
  selection: Set<string>;
  resetSelection: () => void;
  valintakoeTunniste: string;
} & Omit<GetValintakoeExcelParams, 'valintakoeTunniste'>) => {
  const { t } = useTranslations();

  return (
    <ActionBar.Container>
      <Box
        sx={{
          padding: 1,
        }}
      >
        {t('yleinen.hakijoita-valittu-maara', { count: selection.size })}
      </Box>
      <ActionBar.Divider />
      <ValintakoekutsutExcelDownloadButton
        component={ActionBar.Button}
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        valintakoeTunniste={[valintakoeTunniste]}
        selection={selection}
      />
      <ActionBar.Divider />
      <OsoitetarratDownloadButton
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        valintakoeTunniste={valintakoeTunniste}
        selection={selection}
      />
      <ActionBar.Divider />
      <ActionBar.Button
        startIcon={<DeselectOutlined />}
        disabled={selection.size === 0}
        onClick={resetSelection}
      >
        {t('yleinen.poista-valinta')}
      </ActionBar.Button>
    </ActionBar.Container>
  );
};
