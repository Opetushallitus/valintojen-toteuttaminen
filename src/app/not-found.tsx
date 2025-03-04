'use client';
import { Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslations } from '@/app/lib/localization/useTranslations';

export default function Custom404() {
  const { t } = useTranslations();
  return (
    <main>
      <Grid
        container
        direction="column"
        spacing={5}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '132px',
          paddingBottom: '132px',
        }}
      >
        <Grid>
          <Typography variant="h1" color="primary">
            404
          </Typography>
        </Grid>
        <Grid>
          <Typography variant="h2">{t('404.otsikko')}</Typography>
          <Typography variant="body1" component="p">
            {t('404.teksti')}
          </Typography>
        </Grid>
        <Grid>
          <Grid
            container
            direction="row"
            spacing={2}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Grid>
              <Button
                variant="contained"
                aria-label={t('yleinen.palaa-etusivulle')}
                href="/"
              >
                {t('yleinen.palaa-etusivulle')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </main>
  );
}
