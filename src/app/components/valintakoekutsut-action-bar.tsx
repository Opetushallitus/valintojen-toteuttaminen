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
import useToaster from '../hooks/useToaster';
import { SpinnerIcon } from './spinner-icon';
import { colors } from '@opetushallitus/oph-design-system';

export const useExcelDownloadMutation = () => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async (props: GetValintakoeExcelParams) => {
      const { fileName, blob } = await getValintakoeExcel(props);
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

export const useOsoitetarratMutation = () => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async (props: GetValintakoeExcelParams) => {
      const { fileName, blob } = await getValintakoeOsoitetarrat(props);
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
  const noSelection = selection.size === 0;
  const { t } = useTranslation();

  const { mutate: downloadExcel, isPending: isExcelPending } =
    useExcelDownloadMutation();

  return (
    <ActionBar.Button
      startIcon={
        isExcelPending ? (
          <SpinnerIcon sx={{ color: colors.white }} />
        ) : (
          <FileDownloadOutlined />
        )
      }
      disabled={isExcelPending || noSelection}
      onClick={() => {
        downloadExcel({
          hakuOid,
          hakukohdeOid,
          valintakoeTunniste,
          hakemusOids: Array.from(selection),
        });
      }}
    >
      {t('yleinen.vie-taulukkolaskentaan')}
    </ActionBar.Button>
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
  const noSelection = selection.size === 0;
  const { t } = useTranslation();

  const { mutate: downloadOsoitetarrat, isPending } = useOsoitetarratMutation();

  return (
    <ActionBar.Button
      startIcon={
        isPending ? (
          <SpinnerIcon sx={{ color: colors.white }} />
        ) : (
          <NoteOutlined />
        )
      }
      disabled={isPending || noSelection}
      onClick={() => {
        downloadOsoitetarrat({
          hakuOid,
          hakukohdeOid,
          valintakoeTunniste,
          hakemusOids: Array.from(selection),
        });
      }}
    >
      {t('valintakoekutsut.muodosta-osoitetarrat')}
    </ActionBar.Button>
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

  const noSelection = selection.size === 0;

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
        disabled={noSelection}
        onClick={resetSelection}
      >
        {t('yleinen.poista-valinta')}
      </ActionBar.Button>
    </ActionBar.Container>
  );
};
