import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoittelunTila } from '@/lib/types/sijoittelu-types';
import { useHyvaksynnanEhdot } from '@/lib/koodisto/useHyvaksynnanEhdot';
import { ChangeEvent } from 'react';
import { Box, InputAdornment, SelectChangeEvent, Stack } from '@mui/material';
import { LocalizedSelect } from '@/components/localized-select';
import {
  isKorkeakouluHaku,
  isToinenAsteKohdejoukko,
} from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  ophColors,
  OphCheckbox,
  OphInput,
} from '@opetushallitus/oph-design-system';
import { Language } from '@/lib/localization/localization-types';
import { getReadableHakemuksenTila } from '@/lib/sijoittelun-tulokset-utils';
import { entries, map, pipe } from 'remeda';
import { styled } from '@/lib/theme';
import { useHasOrganizationPermissions } from '@/hooks/useUserPermissions';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import { ValinnanTulosChangeParams } from '@/lib/state/valinnan-tulos-machine';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { useValinnanTilaOptions } from '@/hooks/useValinnanTilaOptions';

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
  hakemus.valinnanTila === SijoittelunTila.VARALLA ||
  (hakemus.hyvaksyttyVarasijalta &&
    [
      SijoittelunTila.HYVAKSYTTY,
      SijoittelunTila.PERUUNTUNUT,
      SijoittelunTila.VARALLA,
      SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    ].includes(hakemus?.valinnanTila as SijoittelunTila));

export const EhdollisestiHyvaksyttavissaCheckbox = ({
  haku,
  hakemus,
  disabled,
  updateForm,
}: {
  haku: Haku;
  hakemus: Pick<
    HakemuksenValinnanTulos,
    'hakemusOid' | 'ehdollisestiHyvaksyttavissa'
  >;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
}) => {
  const { t } = useTranslations();
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
    !isToinenAsteKohdejoukko(haku) && (
      <OphCheckbox
        checked={ehdollisestiHyvaksyttavissa}
        onChange={updateEhdollinen}
        label={t('sijoittelun-tulokset.ehdollinen')}
        disabled={disabled || !canUpdate}
      />
    )
  );
};

const EhdollinenFields = ({
  haku,
  hakemus,
  disabled,
  updateForm,
}: {
  haku: Haku;
  hakemus: HakemuksenValinnanTulos;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
}) => {
  const { t, translateEntity } = useTranslations();

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
      />
      {isKorkeakouluHaku(haku) && ehdollisestiHyvaksyttavissa && (
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
  value,
  onChange,
  disabled,
}: Pick<
  React.ComponentProps<typeof LocalizedSelect>,
  'value' | 'onChange' | 'disabled'
>) => {
  const options = useValinnanTilaOptions(
    (tila) => tila !== SijoittelunTila.HARKINNANVARAISESTI_HYVAKSYTTY,
  );

  return (
    <LocalizedSelect
      sx={{ width: '300px' }}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      options={options}
    />
  );
};

export const ValinnanTilaCell = ({
  hakemus,
  haku,
  disabled,
  updateForm,
  isValinnanTilaEditable,
}: {
  hakemus: HakemuksenValinnanTulos;
  isValinnanTilaEditable?: boolean;
  haku: Haku;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const {
    hakemusOid,
    hyvaksyttyVarasijalta,
    siirtynytToisestaValintatapajonosta,
    valinnanTila,
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
      valinnanTila: event.target.value as SijoittelunTila,
    });
  };

  return (
    <Stack gap={1} sx={{ minWidth: '240px' }}>
      <span>
        {isValinnanTilaEditable ? (
          hakemuksenTila
        ) : (
          <ValinnanTilaSelect
            value={valinnanTila}
            onChange={updateValinnanTila}
            disabled={disabled}
          />
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
      <EhdollinenFields
        haku={haku}
        hakemus={hakemus}
        disabled={disabled}
        updateForm={updateForm}
      />
    </Stack>
  );
};
