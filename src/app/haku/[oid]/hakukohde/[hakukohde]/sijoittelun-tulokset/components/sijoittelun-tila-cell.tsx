import { useTranslations } from '@/app/hooks/useTranslations';
import {
  isHyvaksyttyHarkinnanvaraisesti,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
} from '@/app/lib/types/sijoittelu-types';
import { useHyvaksynnanEhdot } from '../hooks/useHyvaksynnanEhdot';
import { useState } from 'react';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { Box, InputAdornment, styled } from '@mui/material';
import { LocalizedSelect } from '@/app/components/localized-select';
import { OphInput } from '@/app/components/form/oph-input';
import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { Haku } from '@/app/lib/types/kouta-types';
import { ophColors } from '@opetushallitus/oph-design-system';
import { StyledOphCheckBox } from '@/app/components/form/styled-oph-checkbox';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';

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

const showHyvaksyVarasijalta = (hakemus: SijoittelunHakemusValintatiedoilla) =>
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

  const [ehdollinen, setEhdollinen] = useState<boolean>(
    hakemus.ehdollisestiHyvaksyttavissa,
  );

  const [ehdollinenSyy, setEhdollinenSyy] = useState(
    hakemus.ehdollisenHyvaksymisenEhtoKoodi,
  );

  const hakemuksenTila = isHyvaksyttyHarkinnanvaraisesti(hakemus)
    ? t('sijoitteluntila.HARKINNANVARAISESTI_HYVAKSYTTY')
    : t(`sijoitteluntila.${hakemus.tila}`);

  return (
    <SijoittelunTulosStyledCell>
      <span>
        {hakemuksenTila}
        {hakemuksenTila === SijoittelunTila.VARALLA
          ? `(${hakemus.varasijanNumero})`
          : ''}
      </span>
      {showHyvaksyVarasijalta(hakemus) && (
        <StyledOphCheckBox
          checked={hakemus.hyvaksyttyVarasijalta}
          onChange={() => ''}
          label={t('sijoittelun-tulokset.varasijalta')}
          disabled={disabled}
        />
      )}
      {isKorkeakouluHaku(haku) && (
        <StyledOphCheckBox
          checked={ehdollinen}
          onChange={() => {
            setEhdollinen(!ehdollinen);
            updateForm({
              hakemusOid: hakemus.hakemusOid,
              ehdollisestiHyvaksyttavissa: !ehdollinen,
            });
          }}
          label={t('sijoittelun-tulokset.ehdollinen')}
          disabled={disabled}
        />
      )}
      {ehdollinen && isKorkeakouluHaku(haku) && (
        <LocalizedSelect
          sx={{ maxWidth: '300px' }}
          value={ehdollinenSyy}
          onChange={(event) => setEhdollinenSyy(event.target.value)}
          options={ehtoOptions}
          disabled={disabled}
        />
      )}
      {ehdollinen && isKorkeakouluHaku(haku) && ehdollinenSyy === 'muu' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}>
          <StyledInput
            value={hakemus.ehdollisenHyvaksymisenEhtoFI ?? ''}
            onChange={() => ''}
            startAdornment={
              <LanguageAdornment position="start">FI</LanguageAdornment>
            }
            inputProps={{
              'aria-label': t('sijoittelun-tulokset.muu-syy-aria-fi'),
            }}
            disabled={disabled}
          />
          <StyledInput
            value={hakemus.ehdollisenHyvaksymisenEhtoSV ?? ''}
            onChange={() => ''}
            startAdornment={
              <LanguageAdornment position="start">SV</LanguageAdornment>
            }
            inputProps={{
              'aria-label': t('sijoittelun-tulokset.muu-syy-aria-sv'),
            }}
            disabled={disabled}
          />
          <StyledInput
            value={hakemus.ehdollisenHyvaksymisenEhtoEN ?? ''}
            onChange={() => ''}
            startAdornment={
              <LanguageAdornment position="start">EN</LanguageAdornment>
            }
            inputProps={{
              'aria-label': t('sijoittelun-tulokset.muu-syy-aria-en'),
            }}
            disabled={disabled}
          />
        </Box>
      )}
    </SijoittelunTulosStyledCell>
  );
};
