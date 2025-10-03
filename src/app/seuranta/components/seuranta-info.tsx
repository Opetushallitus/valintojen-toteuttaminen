'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { styled } from '@/lib/theme';
import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useMemo } from 'react';

const StyledInfoContainer = styled(Box)(({ theme }) => ({
  boxShadow: `0 2px 2px 1px ${ophColors.grey100}`,
  padding: theme.spacing(1.5),
}));

export const SeurantaInfo = ({
  seurantaTiedot,
}: {
  seurantaTiedot: Array<SeurantaTiedotLaajennettu>;
}) => {
  const { t } = useTranslations();

  const info = useMemo(() => {
    const total = seurantaTiedot.length;
    const amounts = seurantaTiedot
      .map((st) => st.tila)
      .reduce(
        (p, n) => {
          p[n] += 1;
          return p;
        },
        { VALMIS: 0, PERUUTETTU: 0, MENEILLAAN: 0, ALOITTAMATTA: 0 },
      );
    return Object.assign(amounts, { YHTEENSA: total });
  }, [seurantaTiedot]);

  return (
    <StyledInfoContainer>
      <Typography variant="h3">
        {t('seuranta.info.otsikko', { total: info.YHTEENSA })}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: '7px' }}>
        <Typography variant="body1">
          {t('seuranta.info.valmiina', { total: info.VALMIS })}
        </Typography>
        <Typography variant="body1" color="error">
          {t('seuranta.info.keskeytynyt', { total: info.PERUUTETTU })}
        </Typography>
        <Typography variant="body1">
          {t('seuranta.info.kaynnissa', { total: info.MENEILLAAN })}
        </Typography>
        <Typography variant="body1">
          {t('seuranta.info.jonossa', { total: info.ALOITTAMATTA })}
        </Typography>
      </Box>
    </StyledInfoContainer>
  );
};
