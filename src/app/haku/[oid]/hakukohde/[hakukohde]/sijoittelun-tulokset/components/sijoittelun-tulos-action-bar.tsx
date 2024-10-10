import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';
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
  hakemukselleNaytetaanIlmoittautumisTila,
  hakemukselleNaytetaanVastaanottoTila,
} from '../lib/sijoittelun-tulokset-utils';

const IlmoittautumisSelect = ({
  hakemukset,
  selection,
}: {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  selection: Set<string>;
}) => {
  const { t } = useTranslations();

  const ilmoittautumistilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => {
      return { value: tila as string, label: t(`ilmoittautumistila.${tila}`) };
    },
  );

  const disabled =
    hakemukset.filter(
      (h) =>
        selection.has(h.hakemusOid) &&
        hakemukselleNaytetaanIlmoittautumisTila(h),
    ).length < 1;

  return (
    <LocalizedSelect
      placeholder="Muuta ilmoittautumistieto"
      onChange={() => ''}
      options={ilmoittautumistilaOptions}
      disabled={disabled}
    />
  );
};

const VastaanOttoSelect = ({
  hakemukset,
  selection,
}: {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
  selection: Set<string>;
}) => {
  const { t } = useTranslations();

  const vastaanottotilaOptions = Object.values(VastaanottoTila).map((tila) => {
    return { value: tila as string, label: t(`vastaanottotila.${tila}`) };
  });

  const disabled =
    hakemukset.filter(
      (h) =>
        selection.has(h.hakemusOid) && hakemukselleNaytetaanVastaanottoTila(h),
    ).length < 1;

  return (
    <LocalizedSelect
      placeholder="Muuta vastaanottotieto"
      onChange={() => ''}
      options={vastaanottotilaOptions}
      disabled={disabled}
    />
  );
};

export const SijoittelunTuloksetActionBar = ({
  hakemukset,
  selection,
  resetSelection,
}: {
  hakemukset: SijoittelunHakemusValintatiedoilla[];
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
      <VastaanOttoSelect hakemukset={hakemukset} selection={selection} />
      <ActionBar.Divider />
      <IlmoittautumisSelect hakemukset={hakemukset} selection={selection} />
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
