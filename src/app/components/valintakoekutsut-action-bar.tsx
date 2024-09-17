import React from 'react';

import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';
import {
  FileDownloadOutlined,
  InsertDriveFileOutlined,
} from '@mui/icons-material';
import { ActionBar } from './action-bar';
import {
  getValintakoeExcel,
  GetValintakoeExcelParams,
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
      const blob = await getValintakoeExcel(props);
      downloadBlob('valintakoeet.xlsx', blob);
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

  const { mutate: downloadExcel, isPending } = useExcelDownloadMutation();

  return (
    <ActionBar.Container>
      <Box padding={1}>
        {t(`valintakoekutsut.valittu-maara`, { count: selection.size })}
      </Box>
      <ActionBar.Divider />
      <ActionBar.Button
        startIcon={
          isPending ? (
            <SpinnerIcon sx={{ color: colors.white }} />
          ) : (
            <FileDownloadOutlined />
          )
        }
        disabled={isPending || noSelection}
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
      <ActionBar.Divider />
      <ActionBar.Button
        startIcon={<InsertDriveFileOutlined />}
        disabled={noSelection}
      >
        {t('valintakoekutsut.muodosta-koekutsut')}
      </ActionBar.Button>
      <ActionBar.Divider />
      <ActionBar.Button
        startIcon={<InsertDriveFileOutlined />}
        disabled={noSelection}
      >
        {t('valintakoekutsut.muodosta-osoitetarrat')}
      </ActionBar.Button>
      <ActionBar.Divider />
      <ActionBar.Button disabled={noSelection} onClick={resetSelection}>
        {t('yleinen.poista-valinta')}
      </ActionBar.Button>
    </ActionBar.Container>
  );
};
