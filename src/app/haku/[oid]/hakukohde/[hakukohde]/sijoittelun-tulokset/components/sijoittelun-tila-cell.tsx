import { useTranslations } from '@/app/hooks/useTranslations';
import {
  isHyvaksyttyHarkinnanvaraisesti,
  SijoittelunHakemusEnriched,
  SijoittelunTila,
} from '@/app/lib/types/sijoittelu-types';
import { useHyvaksynnanEhdot } from '../hooks/useHyvaksynnanEhdot';
import { useState } from 'react';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { LocalizedSelect } from '@/app/components/localized-select';
import { OphInput } from '@/app/components/form/oph-input';
import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { Haku } from '@/app/lib/types/kouta-types';

const showHyvaksyVarasijalta = (hakemus: SijoittelunHakemusEnriched) =>
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
}: {
  hakemus: SijoittelunHakemusEnriched;
  haku: Haku;
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
      <span>{hakemuksenTila}</span>
      {showHyvaksyVarasijalta(hakemus) && (
        <FormControlLabel
          label={t('sijoittelun-tulokset.varasijalta')}
          control={
            <Checkbox
              checked={hakemus.hyvaksyttyVarasijalta}
              onChange={() => ''}
            />
          }
        />
      )}
      {isKorkeakouluHaku(haku) && (
        <FormControlLabel
          label={t('sijoittelun-tulokset.ehdollinen')}
          control={
            <Checkbox
              checked={ehdollinen}
              onChange={() => setEhdollinen(!ehdollinen)}
            />
          }
        />
      )}
      {ehdollinen && isKorkeakouluHaku(haku) && (
        <LocalizedSelect
          sx={{ maxWidth: '300px' }}
          value={ehdollinenSyy}
          onChange={(event) => setEhdollinenSyy(event.target.value)}
          options={ehtoOptions}
        />
      )}
      {ehdollinen && isKorkeakouluHaku(haku) && ehdollinenSyy === 'muu' && (
        <Box>
          <OphInput
            value={hakemus.ehdollisenHyvaksymisenEhtoFI ?? ''}
            onChange={() => ''}
          />
          <OphInput
            value={hakemus.ehdollisenHyvaksymisenEhtoSV ?? ''}
            onChange={() => ''}
          />
          <OphInput
            value={hakemus.ehdollisenHyvaksymisenEhtoEN ?? ''}
            onChange={() => ''}
          />
        </Box>
      )}
    </SijoittelunTulosStyledCell>
  );
};
