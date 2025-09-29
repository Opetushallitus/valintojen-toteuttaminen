'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { styled } from '@/lib/theme';
import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { isNonNullish } from 'remeda';

const StyledDetailsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 3,
  gridArea: 'details',
  borderLeft: '2px solid',
  borderColor: ophColors.grey300,
  paddingLeft: theme.spacing(2),
}));

export const SeurantaItemDetails = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) => {
  const { t } = useTranslations();
  //TODO: näytä valintakoelaskenta ja valinnanvaihe
  return (
    <StyledDetailsContainer>
      <Typography variant="body1">{seurantaTiedot.haunnimi}</Typography>
      <Typography variant="body1">{seurantaTiedot.nimi}</Typography>
      <Typography variant="body2">
        {t('seuranta.hakukohteita', {
          total: seurantaTiedot.hakukohteitaYhteensa,
        })}
      </Typography>
      <Typography variant="body2">
        {isNonNullish(seurantaTiedot.valinnanvaihe)
          ? t('seuranta.valinnanvaihe-osa', {
              valinnanvaihe: seurantaTiedot.valinnanvaihe,
            })
          : t('seuranta.valinnanvaihe-kaikki')}
      </Typography>
      <Typography variant="body2">
        {t('seuranta.valintakoelaskenta')}
        {seurantaTiedot.valintakoelaskenta === true
          ? t('yleinen.kylla')
          : t('yleinen.ei')}
      </Typography>
    </StyledDetailsContainer>
  );
};
