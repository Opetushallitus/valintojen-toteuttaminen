import { useTranslations } from '@/lib/localization/useTranslations';
import { Box } from '@mui/material';
import {
  OphButton,
  OphFormFieldWrapper,
  OphSelect,
} from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import { Haku } from '@/lib/kouta/kouta-types';
import { isToisenAsteenYhteisHaku } from '@/lib/kouta/kouta-service';
import {
  KK_KIRJETYYPIT,
  Letter,
  TOINEN_ASTE_KIRJETYYPIT,
} from '../lib/letter-options';
import { useState } from 'react';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  rowGap: theme.spacing(1),
  alignItems: 'flex-end',
}));

export const LettersActions = ({ haku }: { haku: Haku }) => {
  const { t } = useTranslations();

  const letters = isToisenAsteenYhteisHaku(haku)
    ? TOINEN_ASTE_KIRJETYYPIT
    : KK_KIRJETYYPIT;

  const [letter, setLetter] = useState<Letter>(letters[0]);

  const letterOptions = letters.map((l, index) => {
    const letterType = t(`kirjetyypit.${l.letterType}`);
    const lang = t(`yleinen.kieleksi.${l.lang}`);
    return {
      value: '' + index,
      label: `${letterType} ${lang}`,
    };
  });

  return (
    <ActionsContainer>
      <OphFormFieldWrapper
        label={t('yhteisvalinnan-hallinta.kirjeet.kirjevalitsin')}
        renderInput={() => (
          <OphSelect
            inputProps={{
              'aria-label': t('yhteisvalinnan-hallinta.kirjeet.valitse-kirje'),
            }}
            value={'' + letter.id}
            onChange={(e) => setLetter(letters[parseInt(e.target.value)])}
            options={letterOptions}
            sx={{ width: '340px' }}
          />
        )}
      />
      <OphButton
        onClick={() => console.log('click')}
        variant="contained"
        disabled={false}
        sx={{ marginRight: 3 }}
      >
        {t('yhteisvalinnan-hallinta.kirjeet.muodosta')}
      </OphButton>
      <OphButton
        onClick={() => console.log('click')}
        variant="outlined"
        disabled={false}
      >
        {t('yhteisvalinnan-hallinta.kirjeet.paivita-muodosta')}
      </OphButton>
    </ActionsContainer>
  );
};
