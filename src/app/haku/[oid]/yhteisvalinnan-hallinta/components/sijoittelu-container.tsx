import { AccordionBox } from '@/components/accordion-box';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoitteluActions } from './sijoittelu-actions';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { SijoitteluSchedule } from './sijoittelu-schedule';
import { Box } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { sijoittelunStatus } from '@/lib/sijoittelu/sijoittelu-service';
import { SijoitteluInfo } from './sijoittelu-info';
import { queryOptionsGetHaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-queries';

export const SijoitteluContainer = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  const [{ data: haunAsetukset }, { data: sijoitteluStatus }] =
    useSuspenseQueries({
      queries: [
        queryOptionsGetHaunAsetukset({ hakuOid }),
        {
          queryKey: ['sijoitteluStatus', hakuOid],
          queryFn: () => sijoittelunStatus(hakuOid),
        },
      ],
    });

  const sijoitteluInUse = haunAsetukset.sijoittelu;

  return (
    <AccordionBox
      id="sijoittelu-section"
      title={
        <AccordionBoxTitle
          title={t('yhteisvalinnan-hallinta.sijoittelu.otsikko')}
        />
      }
    >
      {sijoitteluInUse ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 3 }}>
          <SijoitteluActions
            hakuOid={hakuOid}
            sijoitteluRunning={sijoitteluStatus.tekeillaan}
          />
          <SijoitteluSchedule hakuOid={hakuOid} />
        </Box>
      ) : (
        <SijoitteluInfo
          text={t('yhteisvalinnan-hallinta.sijoittelu.ei-kaytossa')}
        />
      )}
    </AccordionBox>
  );
};
