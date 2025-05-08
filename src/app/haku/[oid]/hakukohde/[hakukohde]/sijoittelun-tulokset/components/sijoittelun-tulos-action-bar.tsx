import { Box, SelectChangeEvent } from '@mui/material';
import { DeselectOutlined } from '@mui/icons-material';
import { ActionBar } from '@/components/action-bar';
import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunTulosActorRef,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
} from '@/lib/sijoittelun-tulokset-utils';
import { useVastaanottoTilaOptions } from '@/hooks/useVastaanottoTilaOptions';
import { useIlmoittautumisTilaOptions } from '@/hooks/useIlmoittautumisTilaOptions';
import {
  ValinnanTulosActorRef,
  ValinnanTulosEventType,
  ValinnanTulosMassChangeParams,
} from '@/lib/state/valinnan-tulos-machine';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { useCallback, useState } from 'react';

const IlmoittautumisSelect = ({
  hakemukset,
  selection,
  massStatusChangeForm,
}: {
  hakemukset: Array<HakemuksenValinnanTulos>;
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
    hakemukset.find(
      (h) => selection.has(h.hakemusOid) && isIlmoittautuminenPossible(h),
    ) === undefined;

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
  hakemukset: Array<HakemuksenValinnanTulos>;
  selection: Set<string>;
  massStatusChangeForm: (changeParams: ValinnanTulosMassChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const [value, setValue] = useState<string>('');

  const vastaanottotilaOptions = useVastaanottoTilaOptions();

  const massUpdateVastaanOtto = (event: SelectChangeEvent<string>) => {
    massStatusChangeForm({
      hakemusOids: selection,
      vastaanottoTila: event.target.value as VastaanottoTila,
    });
    setValue('');
  };

  const disabled =
    hakemukset.find(
      (h) => selection.has(h.hakemusOid) && isVastaanottoPossible(h),
    ) === undefined;

  return (
    <LocalizedSelect
      placeholder={t('sijoittelun-tulokset.muuta-vastaanottotieto')}
      onChange={massUpdateVastaanOtto}
      value={value}
      options={vastaanottotilaOptions}
      disabled={disabled}
    />
  );
};

export const SijoittelunTuloksetActionBar = ({
  hakemukset,
  selection,
  resetSelection,
  actorRef,
}: {
  hakemukset: Array<HakemuksenValinnanTulos>;
  actorRef: ValinnanTulosActorRef | SijoittelunTulosActorRef;
  selection: Set<string>;
  resetSelection: () => void;
}) => {
  const massStatusChangeForm = useCallback(
    (changeParams: ValinnanTulosMassChangeParams) => {
      actorRef.send({
        type: ValinnanTulosEventType.MASS_CHANGE,
        ...changeParams,
      });
    },
    [actorRef],
  );
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
