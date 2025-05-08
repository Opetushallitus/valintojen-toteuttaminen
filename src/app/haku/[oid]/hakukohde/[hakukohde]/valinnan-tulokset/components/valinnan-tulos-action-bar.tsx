import { Box, Stack } from '@mui/material';
import { DeselectOutlined } from '@mui/icons-material';
import { ActionBar } from '@/components/action-bar';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunTila,
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
import { useCallback } from 'react';
import { Dropdown } from '@/components/dropdown';
import { useValinnanTilaOptions } from '@/hooks/useValinnanTilaOptions';

const ValinnanTilaSelect = ({
  hakemukset,
  selection,
  massStatusChangeForm,
}: {
  hakemukset: Array<HakemuksenValinnanTulos>;
  selection: Set<string>;
  massStatusChangeForm: (changeParams: ValinnanTulosMassChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const valinnanTilaOptions = useValinnanTilaOptions();

  const disabled =
    hakemukset.find((h) => selection.has(h.hakemusOid)) === undefined;

  return (
    <Dropdown.MenuButton
      disabled={disabled}
      label={t('valinnan-tulokset.muuta-valinnan-tila')}
    >
      {valinnanTilaOptions.map((option) => (
        <Dropdown.MenuItem
          key={option.value}
          label={option.label}
          onClick={() => {
            massStatusChangeForm({
              hakemusOids: selection,
              valinnanTila: option.value as SijoittelunTila,
            });
          }}
        />
      ))}
    </Dropdown.MenuButton>
  );
};

const IlmoittautumisTilaSelect = ({
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

  const disabled =
    hakemukset.find(
      (h) => selection.has(h.hakemusOid) && isIlmoittautuminenPossible(h),
    ) === undefined;

  return (
    <Dropdown.MenuButton
      disabled={disabled}
      label={t('sijoittelun-tulokset.muuta-ilmoittautumistieto')}
    >
      {ilmoittautumistilaOptions.map((option) => (
        <Dropdown.MenuItem
          key={option.value}
          label={option.label}
          onClick={() => {
            massStatusChangeForm({
              hakemusOids: selection,
              ilmoittautumisTila: option.value as IlmoittautumisTila,
            });
          }}
        />
      ))}
    </Dropdown.MenuButton>
  );
};

const VastaanottoTilaSelect = ({
  hakemukset,
  selection,
  massStatusChangeForm,
}: {
  hakemukset: Array<HakemuksenValinnanTulos>;
  selection: Set<string>;
  massStatusChangeForm: (changeParams: ValinnanTulosMassChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const vastaanottotilaOptions = useVastaanottoTilaOptions();

  const disabled =
    hakemukset.find(
      (h) => selection.has(h.hakemusOid) && isVastaanottoPossible(h),
    ) === undefined;

  return (
    <Dropdown.MenuButton
      disabled={disabled}
      label={t('sijoittelun-tulokset.muuta-vastaanottotieto')}
    >
      {vastaanottotilaOptions.map((option) => (
        <Dropdown.MenuItem
          key={option.value}
          label={option.label}
          onClick={() => {
            massStatusChangeForm({
              hakemusOids: selection,
              vastaanottoTila: option.value as VastaanottoTila,
            });
          }}
        />
      ))}
    </Dropdown.MenuButton>
  );
};

export const ValinnanTulosActionBar = ({
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
    <ActionBar.Container sx={{ width: '100%', flexWrap: 'wrap', gap: 1 }}>
      <Box
        sx={{
          padding: 1,
        }}
      >
        {t('yleinen.hakijoita-valittu-maara', { count: selection.size })}
      </Box>
      <ActionBar.Divider />
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <ValinnanTilaSelect
          hakemukset={hakemukset}
          selection={selection}
          massStatusChangeForm={massStatusChangeForm}
        />
        <ActionBar.Divider />
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <VastaanottoTilaSelect
          hakemukset={hakemukset}
          selection={selection}
          massStatusChangeForm={massStatusChangeForm}
        />
        <ActionBar.Divider />
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <IlmoittautumisTilaSelect
          hakemukset={hakemukset}
          selection={selection}
          massStatusChangeForm={massStatusChangeForm}
        />
        <ActionBar.Divider />
      </Stack>

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
