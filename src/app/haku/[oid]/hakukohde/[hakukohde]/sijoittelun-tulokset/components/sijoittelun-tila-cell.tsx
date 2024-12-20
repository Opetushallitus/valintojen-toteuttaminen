import { useTranslations } from '@/app/hooks/useTranslations';
import {
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
} from '@/app/lib/types/sijoittelu-types';
import { useHyvaksynnanEhdot } from '../hooks/useHyvaksynnanEhdot';
import { ChangeEvent, useState } from 'react';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { Box, InputAdornment, SelectChangeEvent, styled } from '@mui/material';
import { LocalizedSelect } from '@/app/components/localized-select';
import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { Haku } from '@/app/lib/types/kouta-types';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';
import {
  ophColors,
  OphCheckbox,
  OphInput,
} from '@opetushallitus/oph-design-system';
import { Language } from '@/app/lib/localization/localization-types';
import { getReadableHakemuksenTila } from '@/app/lib/sijoittelun-tulokset-utils';

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
  updateForm: (params: SijoittelunTuloksetChangeEvent) => void;
}) => {
  const { t, translateEntity } = useTranslations();
  const { data: hyvaksynnanEhdot } = useHyvaksynnanEhdot();

  const ehtoOptions = hyvaksynnanEhdot.map((ehto) => {
    return { value: ehto.koodiArvo, label: translateEntity(ehto.nimi) };
  });

  const [hyvaksyttyVarasijalta, setHyvaksyttyVarasijalta] = useState<boolean>(
    hakemus.hyvaksyttyVarasijalta,
  );

  const [ehdollinen, setEhdollinen] = useState<boolean>(
    hakemus.ehdollisestiHyvaksyttavissa,
  );

  const [ehdollinenSyy, setEhdollinenSyy] = useState(
    hakemus.ehdollisenHyvaksymisenEhtoKoodi,
  );

  const [ehdollisuudenMuuSyyt, setEhdollisuudenMuuSyyt] = useState({
    fi: hakemus.ehdollisenHyvaksymisenEhtoFI,
    sv: hakemus.ehdollisenHyvaksymisenEhtoSV,
    en: hakemus.ehdollisenHyvaksymisenEhtoEN,
  });

  const hakemuksenTila = getReadableHakemuksenTila(hakemus, t);

  const updateEhdollinen = () => {
    setEhdollinen(!ehdollinen);
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      ehdollisestiHyvaksyttavissa: !ehdollinen,
    });
  };

  const updateHyvaksyttyVarasijalta = () => {
    setHyvaksyttyVarasijalta(!hyvaksyttyVarasijalta);
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      hyvaksyttyVarasijalta: !hyvaksyttyVarasijalta,
    });
  };

  const updateEhdollisuudenSyy = (event: SelectChangeEvent<string>) => {
    setEhdollinenSyy(event.target.value);
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      ehdollisuudenSyy: event.target.value,
    });
  };

  const updateEhdollisuudenMuuSyy = (
    event: ChangeEvent<HTMLInputElement>,
    kieli: Language,
  ) => {
    const syy = Object.assign(ehdollisuudenMuuSyyt, {
      [kieli]: event.target.value,
    });
    setEhdollisuudenMuuSyyt(syy);
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      ehdollisuudenSyyKieli: syy,
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
          checked={ehdollinen}
          onChange={updateEhdollinen}
          label={t('sijoittelun-tulokset.ehdollinen')}
          disabled={disabled}
        />
      )}
      {ehdollinen && isKorkeakouluHaku(haku) && (
        <LocalizedSelect
          sx={{ maxWidth: '300px' }}
          value={ehdollinenSyy}
          onChange={updateEhdollisuudenSyy}
          options={ehtoOptions}
          disabled={disabled}
          required={true}
        />
      )}
      {ehdollinen && isKorkeakouluHaku(haku) && ehdollinenSyy === 'muu' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}>
          <StyledInput
            value={ehdollisuudenMuuSyyt.fi ?? ''}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateEhdollisuudenMuuSyy(event, 'fi')
            }
            startAdornment={
              <LanguageAdornment position="start">FI</LanguageAdornment>
            }
            inputProps={{
              'aria-label': t('sijoittelun-tulokset.muu-syy-aria-fi'),
            }}
            disabled={disabled}
            required={true}
          />
          <StyledInput
            value={ehdollisuudenMuuSyyt.sv ?? ''}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateEhdollisuudenMuuSyy(event, 'sv')
            }
            startAdornment={
              <LanguageAdornment position="start">SV</LanguageAdornment>
            }
            inputProps={{
              'aria-label': t('sijoittelun-tulokset.muu-syy-aria-sv'),
            }}
            disabled={disabled}
            required={true}
          />
          <StyledInput
            value={ehdollisuudenMuuSyyt.en ?? ''}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateEhdollisuudenMuuSyy(event, 'en')
            }
            startAdornment={
              <LanguageAdornment position="start">EN</LanguageAdornment>
            }
            inputProps={{
              'aria-label': t('sijoittelun-tulokset.muu-syy-aria-en'),
            }}
            disabled={disabled}
            required={true}
          />
        </Box>
      )}
    </SijoittelunTulosStyledCell>
  );
};
