import { Box } from '@mui/material';
import {
  CheckOutlined,
  DeselectOutlined,
  NoteOutlined,
} from '@mui/icons-material';
import { ActionBar } from '@/components/action-bar';
import { getOsoitetarratHakemuksille } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { HarkinnanvaraisetTilatByHakemusOids } from '@/lib/types/harkinnanvaraiset-types';
import { FileDownloadButton } from '@/components/file-download-button';
import { useCallback } from 'react';
import { useTranslations } from '@/lib/localization/useTranslations';

const HyvaksyValitutButton = ({
  selection,
  onHarkinnanvaraisetTilatChange,
}: {
  selection: Set<string>;
  onHarkinnanvaraisetTilatChange: (
    harkinnanvaraisetTilat: HarkinnanvaraisetTilatByHakemusOids,
  ) => void;
}) => {
  const { t } = useTranslations();

  return (
    <ActionBar.Button
      disabled={selection.size === 0}
      startIcon={<CheckOutlined />}
      onClick={() => {
        const newTilat: HarkinnanvaraisetTilatByHakemusOids = {};
        selection.forEach((hakemusOid) => {
          newTilat[hakemusOid] = 'HYVAKSYTTY';
        });
        onHarkinnanvaraisetTilatChange(newTilat);
      }}
    >
      {t('harkinnanvaraiset.hyvaksy-valitut')}
    </ActionBar.Button>
  );
};

const OsoitetarratDownloadButton = ({
  selection,
}: {
  selection: Set<string>;
}) => {
  const { t } = useTranslations();

  const getFile = useCallback(
    () =>
      getOsoitetarratHakemuksille({
        tag: 'harkinnanvaraiset',
        hakemusOids: Array.from(selection),
      }),
    [selection],
  );

  return (
    <FileDownloadButton
      component={ActionBar.Button}
      disabled={selection.size === 0}
      startIcon={<NoteOutlined />}
      defaultFileName="osoitetarrat.pdf"
      getFile={getFile}
      errorKey="get-osoitetarrat-error"
      errorMessage="virhe.osoitetarrat"
    >
      {t('harkinnanvaraiset.muodosta-osoitetarrat')}
    </FileDownloadButton>
  );
};

export const HarkinnanvaraisetActionBar = ({
  selection,
  resetSelection,
  onHarkinnanvaraisetTilatChange,
}: {
  selection: Set<string>;
  resetSelection: () => void;
  onHarkinnanvaraisetTilatChange: (
    harkinnanvaraisetTilat: HarkinnanvaraisetTilatByHakemusOids,
  ) => void;
}) => {
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
      <HyvaksyValitutButton
        selection={selection}
        onHarkinnanvaraisetTilatChange={onHarkinnanvaraisetTilatChange}
      />
      <ActionBar.Divider />
      <OsoitetarratDownloadButton selection={selection} />
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
