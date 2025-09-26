'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { ophColors, styled } from '@/lib/theme';
import { LaskentaProgressBar } from '@/components/ValintalaskentaStatus';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { timeFromNow } from '@/lib/time-utils';
import { AccessTime } from '@mui/icons-material';

const StyledItemContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  borderColor: ophColors.grey300,
  borderWidth: '1px',
  borderStyle: 'solid',
  display: 'grid',
  gridTemplateColumns: '[status] 35% 25px [details] 60%',
  flexDirection: 'row',
  marginBottom: theme.spacing(1),
}));

const SeurantaStatus = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) => {
  const { t } = useTranslations();

  //TODO kuka teki
  return (
    <Box
      sx={{
        flexGrow: 2,
        display: 'flex',
        flexDirection: 'column',
        rowGap: '5px',
        gridArea: 'status',
      }}
    >
      <Typography variant="h5">
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
      </Box>
      <LaskentaProgressBar seurantaTiedot={seurantaTiedot} />
    </Box>
  );
};

const SeurantaTiedot = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) => {
  const { t } = useTranslations();
  //TODO: näytä valintakoelaskenta ja valinnanvaihe
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 3,
        gridArea: 'details',
      }}
    >
      <Typography variant="body1">{seurantaTiedot.haunnimi}</Typography>
      <Typography variant="body1">{seurantaTiedot.nimi}</Typography>
      <Typography variant="body2">
        {t('seuranta.hakukohteita', {
          total: seurantaTiedot.hakukohteitaYhteensa,
        })}
      </Typography>
    </Box>
  );
};

export default function SeurantaItem({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) {
  return (
    <StyledItemContainer>
      <SeurantaStatus seurantaTiedot={seurantaTiedot} />
      <SeurantaTiedot seurantaTiedot={seurantaTiedot} />
    </StyledItemContainer>
  );
}
