import React from 'react';

import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';
import {
  DeselectOutlined,
  FileDownloadOutlined,
  InsertDriveFileOutlined,
  NoteOutlined,
} from '@mui/icons-material';
import { ActionBar } from './action-bar';
import {
  getValintakoeExcel,
  GetValintakoeExcelParams,
  getValintakoeOsoitetarrat,
} from '../lib/valintalaskentakoostepalvelu';
import { downloadBlob } from '../lib/common';
import { useMutation } from '@tanstack/react-query';
import useToaster from '@/app/hooks/useToaster';
import { DownloadButton } from './download-button';

type ValintakoekutsutDownloadProps = {
  hakuOid: string;
  hakukohdeOid: string;
  valintakoeTunniste: string;
  selection: Set<string>;
};

const useExcelDownloadMutation = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
}: ValintakoekutsutDownloadProps) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getValintakoeExcel({
        hakuOid,
        hakukohdeOid,
        valintakoeTunniste,
        hakemusOids: Array.from(selection),
      });
      downloadBlob(fileName ?? 'valintakoekutsut.xls', blob);
    },
    onError: (e) => {
      addToast({
        key: 'get-valintakoe-excel',
        message: 'valintakoekutsut.virhe-vie-taulukkolaskentaan',
        type: 'error',
      });
      console.error(e);
    },
  });
};

const useOsoitetarratMutation = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  selection,
}: ValintakoekutsutDownloadProps) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getValintakoeOsoitetarrat({
        hakuOid,
        hakukohdeOid,
        valintakoeTunniste,
        hakemusOids: Array.from(selection),
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

const ExcelDownloadButton = ({
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

  const excelMutation = useExcelDownloadMutation({
    hakuOid,
    hakukohdeOid,
    valintakoeTunniste,
    selection,
  });

  return (
    <DownloadButton
      Component={ActionBar.Button}
      disabled={selection.size === 0}
      mutation={excelMutation}
      startIcon={<FileDownloadOutlined />}
    >
      {t('yleinen.vie-taulukkolaskentaan')}
    </DownloadButton>
  );
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
} & GetValintakoeExcelParams) => {
  const { t } = useTranslation();

  return (
    <ActionBar.Container>
      <Box padding={1}>
        {t(`valintakoekutsut.valittu-maara`, { count: selection.size })}
      </Box>
      <ActionBar.Divider />
      <ExcelDownloadButton
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        valintakoeTunniste={valintakoeTunniste}
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
