import { AccordionBox } from '@/components/accordion-box';
import { useTranslations } from '@/lib/localization/useTranslations';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { Box } from '@mui/material';
import { useHaku } from '@/lib/kouta/useHaku';
import { LettersActions } from './letters-actions';

export const LettersContainer = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  const { data: haku } = useHaku({ hakuOid });

  return (
    <AccordionBox
      id="letters-section"
      title={
        <AccordionBoxTitle
          title={t('yhteisvalinnan-hallinta.kirjeet.otsikko')}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 3 }}>
        <LettersActions haku={haku} />
      </Box>
    </AccordionBox>
  );
};
