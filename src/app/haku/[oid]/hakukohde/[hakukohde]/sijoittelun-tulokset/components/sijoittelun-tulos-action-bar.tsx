import { useTranslation } from 'react-i18next';

import { Box, SelectChangeEvent } from '@mui/material';
import { DeselectOutlined } from '@mui/icons-material';
import { ActionBar } from '@/app/components/action-bar';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';
import { HakemuksetStateChangeParams } from '../lib/sijoittelun-tulokset-state-types';
import { useVastaanottoTilaOptions } from '@/app/hooks/useVastaanottoTilaOptions';
import { useIlmoittautumisTilaOptions } from '@/app/hooks/useIlmoittautumisTilaOptions';

const IlmoittautumisSelect = ({
  hakemukset,
  selection,
  massStatusChangeForm,
}: {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  selection: Set<string>;
  massStatusChangeForm: (changeParams: HakemuksetStateChangeParams) => void;
}) => {
  const ilmoittautumistilaOptions = useIlmoittautumisTilaOptions();

  const massUpdateIlmoittautuminen = (event: SelectChangeEvent<string>) => {
    massStatusChangeForm({
      hakemusOids: selection,
      ilmoittautumisTila: event.target.value as IlmoittautumisTila,
    });
  };

  const disabled =
    hakemukset.filter(
      (h) => selection.has(h.hakemusOid) && isIlmoittautuminenPossible(h),
    ).length < 1;

  return (
    <LocalizedSelect
      placeholder="Muuta ilmoittautumistieto"
      onChange={massUpdateIlmoittautuminen}
      options={ilmoittautumistilaOptions}
      disabled={disabled}
    />
  );
};

const VastaanOttoSelect = ({
  hakemukset,
  selection,
  massStatusChangeForm,
}: {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  selection: Set<string>;
  massStatusChangeForm: (changeParams: HakemuksetStateChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const vastaanottotilaOptions = useVastaanottoTilaOptions();

  const massUpdateVastaanOtto = (event: SelectChangeEvent<string>) => {
    massStatusChangeForm({
      hakemusOids: selection,
      vastaanottoTila: event.target.value as VastaanottoTila,
    });
  };

  const disabled =
    hakemukset.filter(
      (h) => selection.has(h.hakemusOid) && isVastaanottoPossible(h),
    ).length < 1;

  return (
    <LocalizedSelect
      placeholder={t('sijoittelun-tulokset.muuta-vastaanottotieto')}
      onChange={massUpdateVastaanOtto}
      options={vastaanottotilaOptions}
      disabled={disabled}
    />
  );
};

export const SijoittelunTuloksetActionBar = ({
  hakemukset,
  selection,
  resetSelection,
  massStatusChangeForm,
}: {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  selection: Set<string>;
  resetSelection: () => void;
  massStatusChangeForm: (changeParams: HakemuksetStateChangeParams) => void;
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <VastaanOttoSelect
          hakemukset={hakemukset}
          selection={selection}
          massStatusChangeForm={massStatusChangeForm}
        />
        <IlmoittautumisSelect
          hakemukset={hakemukset}
          selection={selection}
          massStatusChangeForm={massStatusChangeForm}
        />
      </Box>
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
