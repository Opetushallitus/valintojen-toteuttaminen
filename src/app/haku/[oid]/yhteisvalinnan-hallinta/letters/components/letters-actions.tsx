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
  LetterType,
  templateNameOfLetterType,
  TOINEN_ASTE_KIRJETYYPIT,
  translateLetter,
} from '../lib/letter-options';
import { useState } from 'react';
import { FileDownloadButton } from '@/components/file-download-button';
import {
  luoEiHyvaksymiskirjeetPDFHaulle,
  luoHyvaksymiskirjeetHaullePDF,
} from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  rowGap: theme.spacing(1),
  alignItems: 'flex-end',
}));

export const LettersActions = ({ haku, refetchLetterCounts }: { haku: Haku, refetchLetterCounts: () => void }) => {
  const { t } = useTranslations();

  const letters = isToisenAsteenYhteisHaku(haku)
    ? TOINEN_ASTE_KIRJETYYPIT
    : KK_KIRJETYYPIT;

  const [letter, setLetter] = useState<Letter>(letters[0]);

  const letterOptions = letters.map((l, index) => {
    return {
      value: '' + index,
      label: translateLetter(l, t),
    };
  });

  async function createLetters() {
    const templateName: string = templateNameOfLetterType.get(
      letter.letterType,
    )!;
    if (
      [
        LetterType.HYVAKSYMISKIRJE,
        LetterType.HYVAKSYMISKIRJE_HUOLTAJILLE,
      ].includes(letter.letterType)
    ) {
      return await luoHyvaksymiskirjeetHaullePDF({
        hakuOid: haku.oid,
        lang: letter.lang,
        templateName,
      });
    } else {
      return await luoEiHyvaksymiskirjeetPDFHaulle({
        hakuOid: haku.oid,
        lang: letter.lang,
        templateName,
      });
    }
  }

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
      <FileDownloadButton
        component={OphButton}
        getFile={createLetters}
        variant="contained"
        sx={{ marginRight: 3 }}
        defaultFileName={`${letter.letterType}_${letter.lang}.pdf`}
        errorKey="yhteisvalinta-kirjeet-muodostus"
        errorMessage="yhteisvalinnan-hallinta.sijoittelu.vie-kirjeiksi-virhe"
      >
        {t('yhteisvalinnan-hallinta.kirjeet.muodosta')}
      </FileDownloadButton>
      <OphButton
        onClick={refetchLetterCounts}
        variant="outlined"
        disabled={false}
      >
        {t('yhteisvalinnan-hallinta.kirjeet.paivita-muodosta')}
      </OphButton>
    </ActionsContainer>
  );
};
