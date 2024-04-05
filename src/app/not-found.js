import { Grid, Button, Typography } from '@mui/material';

export default function Custom404() {
  return (
    <Grid
    container
    direction="column"
    justifyContent="center"
    alignItems="center"
    spacing={5}
    sx={{textAlign: 'center', paddingTop: '132px', paddingBottom: '132px'}}>
      <Grid item>
        <Typography variant="h1" component="h1" color="secondary">
          404
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="h2" component="h2">
          Sivua ei löytynyt
        </Typography>
        <Typography variant="body1" paragraph>
          Linkki on virheellinen tai vanhentunut.
        </Typography>
      </Grid>
      <Grid item>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              aria-label="Palaa etusivulle"
              color="primary"
              href="/">
              Palaa etusivulle
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    )
}
