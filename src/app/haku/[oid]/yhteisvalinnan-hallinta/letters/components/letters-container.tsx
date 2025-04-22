import { AccordionBox } from '@/components/accordion-box';
import { useTranslations } from '@/lib/localization/useTranslations';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { Box } from '@mui/material';
import { useHaku } from '@/lib/kouta/useHaku';
import { LettersActions } from './letters-actions';
import { LettersTable } from './letters-table';
import { useQuery } from '@tanstack/react-query';
import { tuloskirjeidenMuodostuksenTilanne } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { isNonNullish } from 'remeda';

export const LettersContainer = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  const { data: haku } = useHaku({ hakuOid });
  const { data: letterCounts, refetch } = useQuery({
    queryKey: ['letters', hakuOid],
    queryFn: () => tuloskirjeidenMuodostuksenTilanne(hakuOid),
  });

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
        <LettersActions haku={haku} refetchLetterCounts={refetch} />
        {isNonNullish(letterCounts) && (
          <LettersTable
            haku={haku}
            letterCounts={letterCounts}
            refetchLetterCounts={refetch}
          />
        )}
      </Box>
    </AccordionBox>
  );
};
