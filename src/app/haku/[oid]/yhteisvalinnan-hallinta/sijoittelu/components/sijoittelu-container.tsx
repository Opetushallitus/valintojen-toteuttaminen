import { AccordionBox } from '@/components/accordion-box';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoitteluActions } from './sijoittelu-actions';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { SijoitteluSchedule } from './sijoittelu-schedule';
import { Box } from '@mui/material';

export const SijoitteluContainer = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  return (
    <AccordionBox
      id="sijoittelu-section"
      title={
        <AccordionBoxTitle
          title={t('yhteisvalinnan-hallinta.sijoittelu.otsikko')}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 3 }}>
        <SijoitteluActions hakuOid={hakuOid} />
        <SijoitteluSchedule />
      </Box>
    </AccordionBox>
  );
};
