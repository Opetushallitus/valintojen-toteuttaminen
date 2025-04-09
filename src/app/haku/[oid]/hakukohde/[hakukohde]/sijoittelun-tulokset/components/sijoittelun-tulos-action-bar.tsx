import { Box, SelectChangeEvent } from '@mui/material';
import { DeselectOutlined } from '@mui/icons-material';
import { ActionBar } from '@/components/action-bar';
import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
} from '@/lib/sijoittelun-tulokset-utils';
import { useVastaanottoTilaOptions } from '@/hooks/useVastaanottoTilaOptions';
import { useIlmoittautumisTilaOptions } from '@/hooks/useIlmoittautumisTilaOptions';
import { ValinnanTulosMassChangeParams } from '@/lib/state/valinnan-tulos-machine';

const IlmoittautumisSelect = ({
  hakemukset,
  selection,
  massStatusChangeForm,
}: {
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  selection: Set<string>;
  massStatusChangeForm: (changeParams: ValinnanTulosMassChangeParams) => void;
}) => {
  const { t } = useTranslations();

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
      placeholder={t('sijoittelun-tulokset.muuta-ilmoittautumistieto')}
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
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  selection: Set<string>;
  massStatusChangeForm: (changeParams: ValinnanTulosMassChangeParams) => void;
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
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  selection: Set<string>;
  resetSelection: () => void;
  massStatusChangeForm: (changeParams: ValinnanTulosMassChangeParams) => void;
}) => {
  const { t } = useTranslations();

  return (
    <ActionBar.Container sx={{ width: '100%' }}>
      <Box
        sx={{
          padding: 1,
        }}
      >
        {t('yleinen.hakijoita-valittu-maara', { count: selection.size })}
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
