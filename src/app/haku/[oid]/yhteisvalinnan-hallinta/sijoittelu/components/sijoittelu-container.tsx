import { AccordionBox } from '@/components/accordion-box';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoitteluActions } from './sijoittelu-actions';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { SijoitteluSchedule } from './sijoittelu-schedule';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { sijoittelunStatus } from '@/lib/sijoittelu/sijoittelu-service';

export const SijoitteluContainer = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  const { data: sijoitteluStatus } = useSuspenseQuery({
    queryKey: ['sijoitteluStatus', hakuOid],
    queryFn: async () => await sijoittelunStatus(hakuOid),
  });

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
        <SijoitteluActions
          hakuOid={hakuOid}
          sijoitteluRunning={sijoitteluStatus.tekeillaan}
        />
        <SijoitteluSchedule />
      </Box>
    </AccordionBox>
  );
};
