import { useTranslations } from '@/lib/localization/useTranslations';
import {
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
} from '@/lib/types/sijoittelu-types';
import { useHyvaksynnanEhdot } from '../hooks/useHyvaksynnanEhdot';
import { ChangeEvent } from 'react';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { Box, InputAdornment, SelectChangeEvent } from '@mui/material';
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

const isHyvaksyttyVarasijaltaVisible = (
  hakemus: SijoittelunHakemusValintatiedoilla,
) =>
  hakemus.tila === SijoittelunTila.VARALLA ||
  (hakemus.hyvaksyttyVarasijalta &&
    [
      SijoittelunTila.HYVAKSYTTY,
      SijoittelunTila.PERUUNTUNUT,
      SijoittelunTila.VARALLA,
      SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    ].includes(hakemus.tila));

export const EhdollisestiHyvaksyttavissaCheckbox = ({
  haku,
  hakemus,
  disabled,
  updateForm,
}: {
  haku: Haku;
  hakemus: Pick<
    SijoittelunHakemusValintatiedoilla,
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
  hakemus: SijoittelunHakemusValintatiedoilla;
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
export const SijoittelunTilaCell = ({
  hakemus,
  haku,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  haku: Haku;
  disabled: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
}) => {
  const { t } = useTranslations();

  const {
    hakemusOid,
    hyvaksyttyVarasijalta,
    siirtynytToisestaValintatapajonosta,
  } = hakemus;

  const hakemuksenTila = getReadableHakemuksenTila(hakemus, t);

  const updateHyvaksyttyVarasijalta = () => {
    updateForm({
      hakemusOid,
      hyvaksyttyVarasijalta: !hyvaksyttyVarasijalta,
    });
  };

  return (
    <SijoittelunTulosStyledCell>
      <span>
        {hakemuksenTila}
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
    </SijoittelunTulosStyledCell>
  );
};
