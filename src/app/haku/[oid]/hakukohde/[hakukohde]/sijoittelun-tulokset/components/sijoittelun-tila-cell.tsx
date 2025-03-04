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
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  ophColors,
  OphCheckbox,
  OphInput,
} from '@opetushallitus/oph-design-system';
import { Language } from '@/lib/localization/localization-types';
import { getReadableHakemuksenTila } from '@/lib/sijoittelun-tulokset-utils';
import { entries, map, pipe } from 'remeda';
import { SijoittelunTulosChangeParams } from '../lib/sijoittelun-tulokset-state';
import { styled } from '@/lib/theme';

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

export const SijoittelunTilaCell = ({
  hakemus,
  haku,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  haku: Haku;
  disabled: boolean;
  updateForm: (params: SijoittelunTulosChangeParams) => void;
}) => {
  const { t, translateEntity } = useTranslations();
  const { data: hyvaksynnanEhdot } = useHyvaksynnanEhdot();

  const ehtoOptions = hyvaksynnanEhdot.map((ehto) => {
    return { value: ehto.koodiArvo, label: translateEntity(ehto.nimi) };
  });

  const {
    hakemusOid,
    hyvaksyttyVarasijalta,
    ehdollisestiHyvaksyttavissa,
    ehdollisenHyvaksymisenEhtoKoodi,
    ehdollisenHyvaksymisenEhtoFI,
    ehdollisenHyvaksymisenEhtoSV,
    ehdollisenHyvaksymisenEhtoEN,
  } = hakemus;

  const ehdollisenHyvaksymisenSyyt = {
    fi: ehdollisenHyvaksymisenEhtoFI,
    sv: ehdollisenHyvaksymisenEhtoSV,
    en: ehdollisenHyvaksymisenEhtoEN,
  };

  const hakemuksenTila = getReadableHakemuksenTila(hakemus, t);

  const updateEhdollinen = () => {
    updateForm({
      hakemusOid,
      ehdollisestiHyvaksyttavissa: !ehdollisestiHyvaksyttavissa,
    });
  };

  const updateHyvaksyttyVarasijalta = () => {
    updateForm({
      hakemusOid,
      hyvaksyttyVarasijalta: !hyvaksyttyVarasijalta,
    });
  };

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

  return (
    <SijoittelunTulosStyledCell>
      <span>{hakemuksenTila}</span>
      {isHyvaksyttyVarasijaltaVisible(hakemus) && (
        <OphCheckbox
          checked={hyvaksyttyVarasijalta}
          onChange={updateHyvaksyttyVarasijalta}
          label={t('sijoittelun-tulokset.varasijalta')}
          disabled={disabled}
        />
      )}
      {isKorkeakouluHaku(haku) && (
        <OphCheckbox
          checked={ehdollisestiHyvaksyttavissa}
          onChange={updateEhdollinen}
          label={t('sijoittelun-tulokset.ehdollinen')}
          disabled={disabled}
        />
      )}
      {ehdollisestiHyvaksyttavissa && isKorkeakouluHaku(haku) && (
        <LocalizedSelect
          sx={{ maxWidth: '300px' }}
          value={ehdollisenHyvaksymisenEhtoKoodi}
          onChange={updateEhdollisuudenSyy}
          options={ehtoOptions}
          disabled={disabled}
          required={true}
        />
      )}
      {ehdollisestiHyvaksyttavissa &&
        isKorkeakouluHaku(haku) &&
        ehdollisenHyvaksymisenEhtoKoodi === 'muu' && (
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
    </SijoittelunTulosStyledCell>
  );
};
