import { AccordionBox } from '@/components/accordion-box';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoitteluActions } from './sijoittelu-actions';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { SijoitteluSchedule } from './sijoittelu-schedule';
import { Box, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { sijoittelunStatus } from '@/lib/sijoittelu/sijoittelu-service';
import { useHaku } from '@/lib/kouta/useHaku';
import { useHaunAsetukset } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/lib/kouta/kouta-service';
import { InfoOutlined } from '@mui/icons-material';
import { ophColors } from '@opetushallitus/oph-design-system';

export const SijoitteluContainer = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  const { data: sijoitteluStatus } = useSuspenseQuery({
    queryKey: ['sijoitteluStatus', hakuOid],
    queryFn: async () => await sijoittelunStatus(hakuOid),
  });

  const { data: haku } = useHaku({ hakuOid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid });

  const sijoitteluFunctionalityNotInUse =
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa({ haku, haunAsetukset });

  return (
    <AccordionBox
      id="sijoittelu-section"
      title={
        <AccordionBoxTitle
          title={t('yhteisvalinnan-hallinta.sijoittelu.otsikko')}
        />
      }
    >
      {sijoitteluFunctionalityNotInUse && (
        <Typography
          variant="body1"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            marginTop: 1,
            columnGap: 1,
          }}
        >
          <InfoOutlined htmlColor={ophColors.blue2} />
          {t('yhteisvalinnan-hallinta.sijoittelu.ei-kaytossa')}
        </Typography>
      )}
      {!sijoitteluFunctionalityNotInUse && (
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
