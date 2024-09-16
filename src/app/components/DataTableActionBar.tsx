import React from 'react';

import { useTranslation } from 'react-i18next';

import { styled, withDefaultProps } from '@/app/theme';
import { Box, Divider } from '@mui/material';
import { Button, colors } from '@opetushallitus/oph-design-system';
import {
  FileDownloadOutlined,
  InsertDriveFileOutlined,
} from '@mui/icons-material';

const ButtonBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(0.5, 1),
  alignItems: 'center',
  borderRadius: '3px',
  columnGap: theme.spacing(1),
}));

const ActionButton = withDefaultProps(
  styled(Button)(({ theme }) => ({
    color: colors.white,
    padding: theme.spacing(1),
    '&:hover': {
      color: colors.white,
      backgroundColor: theme.palette.primary.light,
    },
  })),
  { variant: 'text' },
);

const VerticalDivider = withDefaultProps(
  styled(Divider)({
    backgroundColor: colors.grey400,
    width: '2px',
  }),
  {
    orientation: 'vertical',
    flexItem: true,
    variant: 'middle',
  },
);

export const DataTableActionBar = ({
  selection,
  resetSelection,
}: {
  selection: Set<string>;
  resetSelection: () => void;
}) => {
  const { t } = useTranslation();

  const noSelection = selection.size === 0;

  return (
    <ButtonBox>
      <Box padding={1}>
        {t(`valintakoekutsut.valittu-maara`, { count: selection.size })}
      </Box>
      <VerticalDivider sx={{ color: colors.white }} />
      <ActionButton startIcon={<FileDownloadOutlined />} disabled={noSelection}>
        {t('yleinen.vie-taulukkolaskentaan')}
      </ActionButton>
      <VerticalDivider />
      <ActionButton
        startIcon={<InsertDriveFileOutlined />}
        disabled={noSelection}
      >
        {t('valintakoekutsut.muodosta-koekutsut')}
      </ActionButton>
      <VerticalDivider />
      <ActionButton
        startIcon={<InsertDriveFileOutlined />}
        disabled={noSelection}
      >
        {t('valintakoekutsut.muodosta-osoitetarrat')}
      </ActionButton>
      <VerticalDivider />
      <ActionButton disabled={noSelection} onClick={resetSelection}>
        {t('yleinen.poista-valinta')}
      </ActionButton>
    </ButtonBox>
  );
};
