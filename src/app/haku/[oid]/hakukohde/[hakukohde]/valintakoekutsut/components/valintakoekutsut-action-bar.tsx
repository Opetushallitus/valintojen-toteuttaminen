import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';
import { DeselectOutlined, NoteOutlined } from '@mui/icons-material';
import { ActionBar } from '@/app/components/action-bar';
import {
  GetValintakoeExcelParams,
  getValintakoeOsoitetarrat,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { ValintakoekutsutExcelDownloadButton } from './valintakoekutsut-excel-download-button';
import { FileDownloadButton } from '@/app/components/file-download-button';

const OsoitetarratDownloadButton = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintakoeTunniste: string;
  selection: Set<string>;
}) => {
  const { t } = useTranslation();

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
      errorMessage="valintakoekutsut.virhe-osoitetarrat"
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
  const { t } = useTranslation();

  return (
    <ActionBar.Container>
      <Box
        sx={{
          padding: 1,
        }}
      >
        {t(`valintakoekutsut.valittu-maara`, { count: selection.size })}
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
