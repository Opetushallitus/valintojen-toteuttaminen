import { AccordionBox } from '@/components/accordion-box';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoitteluActions } from './sijoittelu-actions';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { SijoitteluSchedule } from './sijoittelu-schedule';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { sijoittelunStatus } from '@/lib/sijoittelu/sijoittelu-service';
import { useHaku } from '@/lib/kouta/useHaku';
import { useHaunAsetukset } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { usesLaskentaOrSijoittelu } from '@/lib/kouta/kouta-service';
import { SijoitteluInfo } from './sijoittelu-info';

export const SijoitteluContainer = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  const { data: sijoitteluStatus } = useSuspenseQuery({
    queryKey: ['sijoitteluStatus', hakuOid],
    queryFn: async () => await sijoittelunStatus(hakuOid),
  });

  const { data: haku } = useHaku({ hakuOid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid });

  const sijoitteluInUse = usesLaskentaOrSijoittelu({ haku, haunAsetukset });

  return (
    <AccordionBox
      id="sijoittelu-section"
      title={
        <AccordionBoxTitle
          title={t('yhteisvalinnan-hallinta.sijoittelu.otsikko')}
        />
      }
    >
      {!sijoitteluInUse && (
        <SijoitteluInfo
          text={t('yhteisvalinnan-hallinta.sijoittelu.ei-kaytossa')}
        />
      )}
      {sijoitteluInUse && (
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 3 }}>
          <SijoitteluActions
            hakuOid={hakuOid}
            sijoitteluRunning={sijoitteluStatus.tekeillaan}
          />
          <SijoitteluSchedule hakuOid={hakuOid} />
        </Box>
      )}
    </AccordionBox>
  );
};
