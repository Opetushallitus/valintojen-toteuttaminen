import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';
import {
  CheckOutlined,
  DeselectOutlined,
  NoteOutlined,
} from '@mui/icons-material';
import { ActionBar } from '@/app/components/action-bar';
import { useMutation } from '@tanstack/react-query';
import useToaster from '@/app/hooks/useToaster';
import { DownloadButton } from '@/app/components/download-button';
import { getOsoitetarratHakemuksille } from '@/app/lib/valintalaskentakoostepalvelu';
import { downloadBlob } from '@/app/lib/common';
import { HarkinnanvaraisetTilatByHakemusOids } from './harkinnanvaraiset-table';

const useOsoitetarratMutation = ({ selection }: { selection: Set<string> }) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getOsoitetarratHakemuksille({
        tag: 'harkinnanvaraiset',
        hakemusOids: Array.from(selection),
      });
      downloadBlob(fileName ?? 'osoitetarrat.pdf', blob);
    },
    onError: (e) => {
      addToast({
        key: 'get-osoitetarrat',
        message: 'harkinnanvaraiset.virhe-osoitetarrat',
        type: 'error',
      });
      console.error(e);
    },
  });
};

const HyvaksyValitutButton = ({
  selection,
  onHarkinnanvaraisetTilatChange,
}: {
  selection: Set<string>;
  onHarkinnanvaraisetTilatChange: (
    harkinnanvaraisetTilat: HarkinnanvaraisetTilatByHakemusOids,
  ) => void;
}) => {
  const { t } = useTranslation();

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
  const { t } = useTranslation();

  const osoitetarratMutation = useOsoitetarratMutation({
    selection,
  });

  return (
    <DownloadButton
      Component={ActionBar.Button}
      disabled={selection.size === 0}
      mutation={osoitetarratMutation}
      startIcon={<NoteOutlined />}
    >
      {t('harkinnanvaraiset.muodosta-osoitetarrat')}
    </DownloadButton>
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
  const { t } = useTranslation();

  return (
    <ActionBar.Container>
      <Box
        sx={{
          padding: 1,
        }}
      >
        {t(`harkinnanvaraiset.valittu-maara`, { count: selection.size })}
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
