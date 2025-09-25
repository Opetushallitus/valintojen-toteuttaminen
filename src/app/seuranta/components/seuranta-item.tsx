'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { ophColors, styled } from '@/lib/theme';
import { LaskentaProgressBar } from '@/components/ValintalaskentaStatus';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';

const StyledItemContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  borderColor: ophColors.grey300,
  borderWidth: '1px',
  borderStyle: 'solid',
  display: 'flex',
  flexDirection: 'row',
  marginBottom: theme.spacing(1),
}));

const SeurantaStatus = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) => {
  //TODO kuka teki ja kauanko aikaa on kulunut
  //TODO translate tila
  return (
    <Box sx={{ flexGrow: 2 }}>
      <Typography variant="h5">
        {seurantaTiedot.tila} {toFormattedDateTimeString(seurantaTiedot.luotu)}
      </Typography>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 3 }}>
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
