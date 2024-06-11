'use client';
import { Grid, Button, Typography } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

export default function Custom404() {
  const { t } = useTranslations();
  return (
    <main>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={5}
        sx={{
          textAlign: 'center',
          paddingTop: '132px',
          paddingBottom: '132px',
        }}
      >
        <Grid item>
          <Typography variant="h1" component="h1" color="secondary">
            404
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h2" component="h2">
            {t('404.otsikko')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('404.teksti')}
          </Typography>
        </Grid>
        <Grid item>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
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
