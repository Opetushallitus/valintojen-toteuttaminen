import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';
import { DeselectOutlined } from '@mui/icons-material';
import { ActionBar } from '@/app/components/action-bar';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';

const IlmoittautumisSelect = () => {
  const { t } = useTranslations();

  const ilmoittautumistilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => {
      return { value: tila as string, label: t(`ilmoittautumistila.${tila}`) };
    },
  );

  return (
    <LocalizedSelect
      placeholder="Muuta ilmoittautumistieto"
      onChange={() => ''}
      options={ilmoittautumistilaOptions}
    />
  );
};

const VastaanOttoSelect = () => {
  const { t } = useTranslations();

  const vastaanottotilaOptions = Object.values(VastaanottoTila).map((tila) => {
    return { value: tila as string, label: t(`vastaanottotila.${tila}`) };
  });

  return (
    <LocalizedSelect
      placeholder="Muuta vastaanottotieto"
      onChange={() => ''}
      options={vastaanottotilaOptions}
    />
  );
};

export const SijoittelunTuloksetActionBar = ({
  selection,
  resetSelection,
}: {
  selection: Set<string>;
  resetSelection: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <ActionBar.Container sx={{ width: '100%' }}>
      <Box
        sx={{
          padding: 1,
        }}
      >
        {t(`valintakoekutsut.valittu-maara`, { count: selection.size })}
      </Box>
      <ActionBar.Divider />
      <VastaanOttoSelect />
      <ActionBar.Divider />
      <IlmoittautumisSelect />
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
