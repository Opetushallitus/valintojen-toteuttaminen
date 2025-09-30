'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { LaskentaProgressBar } from '@/components/ValintalaskentaStatus';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { timeFromNow } from '@/lib/time-utils';
import { AccessTime, Person } from '@mui/icons-material';
import { PersonDetails } from '@/lib/oppijanumerorekisteri/onr-types';
import { getHenkiloInitials } from '@/lib/henkilo-utils';
import { ExternalLink } from '@/components/external-link';
import { styled } from '@/lib/theme';

const buildLinkToPerson = (personDetails: PersonDetails): string =>
  `henkilo-ui/virkailija/${personDetails.oidHenkilo}`;

const StyledStatusContainer = styled(Box)(({ theme }) => ({
  flexGrow: 2,
  display: 'flex',
  flexDirection: 'column',
  rowGap: '5px',
  gridArea: 'status',
  padding: theme.spacing(2),
}));

export const SeurantaItemStatus = ({
  seurantaTiedot,
  personDetails,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
  personDetails?: PersonDetails;
}) => {
  const { t } = useTranslations();

  return (
    <StyledStatusContainer>
      <Typography variant="body1" sx={{ fontWeight: 'bolder' }}>
        {t(`valintalaskenta.tila.${seurantaTiedot.tila}`)}{' '}
        {toFormattedDateTimeString(seurantaTiedot.luotu)}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: '3px',
          flexWrap: 'wrap',
        }}
      >
        <AccessTime />
        <Typography variant="body1">
          {t('seuranta.valmistunut', {
            timeFromNow: timeFromNow(seurantaTiedot.luotu),
          })}
        </Typography>
        <Person />
        {personDetails && (
          <ExternalLink
            noIcon={true}
            title={`${personDetails.etunimet} ${personDetails.sukunimi}`}
            name={getHenkiloInitials(personDetails)}
            href={buildLinkToPerson(personDetails)}
          />
        )}
      </Box>
      {seurantaTiedot.tila !== 'PERUUTETTU' && (
        <LaskentaProgressBar seurantaTiedot={seurantaTiedot} />
      )}
    </StyledStatusContainer>
  );
};
