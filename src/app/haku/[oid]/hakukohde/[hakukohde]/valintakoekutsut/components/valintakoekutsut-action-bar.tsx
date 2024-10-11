import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';
import {
  DeselectOutlined,
  InsertDriveFileOutlined,
  NoteOutlined,
} from '@mui/icons-material';
import { ActionBar } from '@/app/components/action-bar';
import {
  GetValintakoeExcelParams,
  getValintakoeOsoitetarrat,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { downloadBlob } from '@/app/lib/common';
import { useMutation } from '@tanstack/react-query';
import useToaster from '@/app/hooks/useToaster';
import { DownloadButton } from '@/app/components/download-button';
import { ValintakoekutsutDownloadProps } from '@/app/lib/types/valintakoekutsut-types';
import { ValintakoekutsutExcelDownloadButton } from './valintakoekutsut-excel-download-button';

const useOsoitetarratMutation = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
}: Omit<ValintakoekutsutDownloadProps, 'valintakoeTunniste'> & {
  valintakoeTunniste: string;
}) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getValintakoeOsoitetarrat({
        hakuOid,
        hakukohdeOid,
        valintakoeTunniste,
        hakemusOids: selection && Array.from(selection),
      });
      downloadBlob(fileName ?? 'osoitetarrat.pdf', blob);
    },
    onError: (e) => {
      addToast({
        key: 'get-osoitetarrat',
        message: 'valintakoekutsut.virhe-osoitetarrat',
        type: 'error',
      });
      console.error(e);
    },
  });
};

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

  const osoitetarratMutation = useOsoitetarratMutation({
    hakuOid,
    hakukohdeOid,
    valintakoeTunniste,
    selection,
  });

  return (
    <DownloadButton
      Component={ActionBar.Button}
      disabled={selection.size === 0}
      mutation={osoitetarratMutation}
      startIcon={<NoteOutlined />}
    >
      {t('valintakoekutsut.muodosta-osoitetarrat')}
    </DownloadButton>
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
        Component={ActionBar.Button}
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        valintakoeTunniste={[valintakoeTunniste]}
        selection={selection}
      />
      <ActionBar.Divider />
      <ActionBar.Button startIcon={<InsertDriveFileOutlined />} disabled={true}>
        {/* TODO: Toteutetaan koekutsujen muodostaminen eri tiketillä */}
        {t('valintakoekutsut.muodosta-koekutsut')}
      </ActionBar.Button>
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
