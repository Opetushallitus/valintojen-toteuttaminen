import { TFunction } from '@/lib/localization/useTranslations';
import { ValinnanTila, VastaanottoTila } from '@/lib/types/sijoittelu-types';
import { useHyvaksynnanEhdot } from '@/lib/koodisto/useHyvaksynnanEhdot';
import { ChangeEvent, memo } from 'react';
import {
  Box,
  InputAdornment,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { LocalizedSelect } from '@/components/localized-select';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  ophColors,
  OphCheckbox,
  OphInput,
} from '@opetushallitus/oph-design-system';
import {
  Language,
  TranslatedName,
} from '@/lib/localization/localization-types';
import { getReadableHakemuksenTila } from '@/lib/sijoittelun-tulokset-utils';
import { entries, map, pipe } from 'remeda';
import { styled } from '@/lib/theme';
import { useHasOrganizationPermissions } from '@/hooks/useUserPermissions';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import { ValinnanTulosChangeParams } from '@/lib/state/valinnan-tulos-machine';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { useValinnanTilaOptions } from '@/hooks/useValinnanTilaOptions';
import { isValidValinnanTila } from '@/lib/valinnan-tulokset-utils';

const LanguageAdornment = styled(InputAdornment)(() => ({
  backgroundColor: ophColors.grey200,
  p: {
    color: ophColors.black,
  },
  height: '100%',
  width: '3rem',
  maxHeight: 'unset',
  justifyContent: 'center',
}));

const StyledInput = styled(OphInput)(() => ({
  paddingLeft: 0,
}));

const isHyvaksyttyVarasijaltaVisible = (hakemus: HakemuksenValinnanTulos) =>
  hakemus.valinnanTila === ValinnanTila.VARALLA ||
  (hakemus.hyvaksyttyVarasijalta &&
    [
      ValinnanTila.HYVAKSYTTY,
      ValinnanTila.PERUUNTUNUT,
      ValinnanTila.VARALLA,
      ValinnanTila.VARASIJALTA_HYVAKSYTTY,
    ].includes(hakemus?.valinnanTila as ValinnanTila));

export const EhdollisestiHyvaksyttavissaCheckbox = ({
  haku,
  hakemus,
  disabled,
  updateForm,
  t,
}: {
  haku: Haku;
  hakemus: Pick<
    HakemuksenValinnanTulos,
    'hakemusOid' | 'ehdollisestiHyvaksyttavissa'
  >;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
  t: TFunction;
}) => {
  const { hakemusOid, ehdollisestiHyvaksyttavissa } = hakemus;

  const updateEhdollinen = () => {
    updateForm({
      hakemusOid,
      ehdollisestiHyvaksyttavissa: !ehdollisestiHyvaksyttavissa,
    });
  };

  const canUpdate = useHasOrganizationPermissions(
    haku.organisaatioOid,
    'READ_UPDATE',
  );

  return (
    <OphCheckbox
      checked={Boolean(ehdollisestiHyvaksyttavissa)}
      onChange={updateEhdollinen}
      label={t('sijoittelun-tulokset.ehdollinen')}
      disabled={disabled || !canUpdate}
    />
  );
};

const HylkayksenSyyFields = ({
  hakemus,
  disabled,
  updateForm,
  t,
}: {
  hakemus: HakemuksenValinnanTulos;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
  t: TFunction;
}) => {
  const updateValinnanTilanKuvaus = (
    event: ChangeEvent<HTMLInputElement>,
    kieli: Language,
  ) => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      [`valinnanTilanKuvaus${kieli.toUpperCase()}`]: event.target.value,
    });
  };

  const valinnanTilanKuvaus = {
    fi: hakemus.valinnanTilanKuvausFI,
    sv: hakemus.valinnanTilanKuvausSV,
    en: hakemus.valinnanTilanKuvausEN,
  };

  const labelId = `hylkayksen-syy-label-${hakemus.hakemusOid}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}>
      <Typography id={labelId}>
        {t('valinnan-tulokset.hakijalle-nakyva-syy')}:
      </Typography>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}
        aria-labelledby={labelId}
      >
        {pipe(
          entries(valinnanTilanKuvaus),
          map(([kieli, syy]) => (
            <StyledInput
              key={kieli}
              value={syy ?? ''}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateValinnanTilanKuvaus(event, kieli)
              }
              startAdornment={
                <LanguageAdornment position="start">
                  {kieli.toUpperCase()}
                </LanguageAdornment>
              }
              inputProps={{
                'aria-label': t(
                  `valinnan-tulokset.valinnan-tilan-kuvaus-aria-${kieli}`,
                ),
              }}
              disabled={disabled}
              required={true}
            />
          )),
        )}
      </Box>
    </Box>
  );
};

const EhdollinenFields = ({
  haku,
  hakemus,
  disabled,
  updateForm,
  t,
  translateEntity,
}: {
  haku: Haku;
  hakemus: HakemuksenValinnanTulos;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
  t: TFunction;
  translateEntity: (entity: TranslatedName) => string;
}) => {
  const { data: hyvaksynnanEhdot } = useHyvaksynnanEhdot();

  const ehtoOptions = hyvaksynnanEhdot.map((ehto) => {
    return { value: ehto.koodiArvo, label: translateEntity(ehto.nimi) };
  });

  const updateEhdollisuudenSyy = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid,
      ehdollisenHyvaksymisenEhtoKoodi: event.target.value,
    });
  };

  const updateEhdollisuudenMuuSyy = (
    event: ChangeEvent<HTMLInputElement>,
    kieli: Language,
  ) => {
    updateForm({
      hakemusOid: hakemusOid,
      [`ehdollisenHyvaksymisenEhto${kieli.toUpperCase()}`]: event.target.value,
    });
  };

  const {
    hakemusOid,
    ehdollisestiHyvaksyttavissa,
    ehdollisenHyvaksymisenEhtoKoodi,
  } = hakemus;

  const ehdollisenHyvaksymisenSyyt = {
    fi: hakemus.ehdollisenHyvaksymisenEhtoFI,
    sv: hakemus.ehdollisenHyvaksymisenEhtoSV,
    en: hakemus.ehdollisenHyvaksymisenEhtoEN,
  };

  return (
    <>
      <EhdollisestiHyvaksyttavissaCheckbox
        haku={haku}
        hakemus={hakemus}
        updateForm={updateForm}
        disabled={disabled}
        t={t}
      />
      {ehdollisestiHyvaksyttavissa && (
        <>
          <LocalizedSelect
            sx={{ maxWidth: '300px' }}
            value={ehdollisenHyvaksymisenEhtoKoodi}
            onChange={updateEhdollisuudenSyy}
            options={ehtoOptions}
            disabled={disabled}
            required={true}
          />
          {ehdollisenHyvaksymisenEhtoKoodi === 'muu' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}>
              {pipe(
                entries(ehdollisenHyvaksymisenSyyt),
                map(([kieli, syy]) => (
                  <StyledInput
                    key={kieli}
                    value={syy ?? ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateEhdollisuudenMuuSyy(event, kieli)
                    }
                    startAdornment={
                      <LanguageAdornment position="start">
                        {kieli.toUpperCase()}
                      </LanguageAdornment>
                    }
                    inputProps={{
                      'aria-label': t(
                        `sijoittelun-tulokset.muu-syy-aria-${kieli}`,
                      ),
                    }}
                    disabled={disabled}
                    required={true}
                  />
                )),
              )}
            </Box>
          )}
        </>
      )}
    </>
  );
};

const ValinnanTilaSelect = ({
  hakemus,
  onChange,
  disabled,
  error,
}: { hakemus: HakemuksenValinnanTulos } & Pick<
  React.ComponentProps<typeof LocalizedSelect>,
  'onChange' | 'disabled' | 'error'
>) => {
  const valinnanTila =
    hakemus.valinnanTila === ValinnanTila.PERUNUT &&
    hakemus.vastaanottoTila === VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA
      ? ValinnanTila.PERUUNTUNUT
      : hakemus.valinnanTila;

  const options = useValinnanTilaOptions(
    (tila) => tila !== ValinnanTila.HARKINNANVARAISESTI_HYVAKSYTTY,
  );

  return (
    <LocalizedSelect
      sx={{ width: '300px' }}
      value={valinnanTila ?? ''}
      onChange={onChange}
      disabled={disabled}
      options={options}
      clearable={true}
      error={error}
    />
  );
};

export const ValinnanTilaCell = memo(function ValinnanTilaCell({
  hakemus,
  haku,
  disabled,
  updateForm,
  mode,
  t,
  translateEntity,
}: {
  hakemus: HakemuksenValinnanTulos;
  haku: Haku;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
  mode: 'valinta' | 'sijoittelu';
  t: TFunction;
  translateEntity: (entity: TranslatedName) => string;
}) {
  const {
    hakemusOid,
    hyvaksyttyVarasijalta,
    siirtynytToisestaValintatapajonosta,
    valinnanTila,
    vastaanottoTila,
  } = hakemus;

  const hakemuksenTila = getReadableHakemuksenTila(hakemus, t);

  const updateHyvaksyttyVarasijalta = () => {
    updateForm({
      hakemusOid,
      hyvaksyttyVarasijalta: !hyvaksyttyVarasijalta,
    });
  };

  const updateValinnanTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid,
      valinnanTila: event.target.value as ValinnanTila,
    });
  };

  return (
    <Stack gap={1} sx={{ minWidth: '240px' }}>
      <span>
        {mode === 'valinta' ? (
          <ValinnanTilaSelect
            hakemus={hakemus}
            onChange={updateValinnanTila}
            disabled={
              disabled ||
              (vastaanottoTila && vastaanottoTila !== VastaanottoTila.KESKEN)
            }
            error={!isValidValinnanTila(hakemus)}
          />
        ) : (
          hakemuksenTila
        )}
        {siirtynytToisestaValintatapajonosta && (
          <InfoTooltipButton
            title={t(
              'sijoittelun-tulokset.taulukko.siirtynyt-toisesta-valintatapajonosta',
            )}
          />
        )}
      </span>
      {isHyvaksyttyVarasijaltaVisible(hakemus) && (
        <OphCheckbox
          checked={hyvaksyttyVarasijalta}
          onChange={updateHyvaksyttyVarasijalta}
          label={t('sijoittelun-tulokset.varasijalta')}
          disabled={disabled}
        />
      )}
      {mode === 'valinta' && valinnanTila === ValinnanTila.HYLATTY && (
        <HylkayksenSyyFields
          hakemus={hakemus}
          disabled={disabled}
          updateForm={updateForm}
          t={t}
        />
      )}
      {valinnanTila !== ValinnanTila.HYLATTY && isKorkeakouluHaku(haku) && (
        <EhdollinenFields
          haku={haku}
          hakemus={hakemus}
          disabled={disabled}
          updateForm={updateForm}
          t={t}
          translateEntity={translateEntity}
        />
      )}
    </Stack>
  );
});
