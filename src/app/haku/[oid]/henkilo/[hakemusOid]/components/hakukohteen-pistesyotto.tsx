import { Box, Typography } from '@mui/material';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { HakutoiveTitle } from '@/components/hakutoive-title';
import { HenkilonPistesyottoActorRef } from '../lib/henkilon-pistesyotto-state';
import { KokeenPistesyotto } from './kokeen-pistesyotto';

export const HakukohteenPisteSyotto = ({
  hakija,
  hakukohde,
  pistesyottoActorRef,
  disabled,
}: {
  hakija: HakijaInfo;
  hakukohde: HenkilonHakukohdeTuloksilla;
  pistesyottoActorRef: HenkilonPistesyottoActorRef;
  disabled: boolean;
}) => {
  return (
    <Box data-test-id={`henkilo-pistesyotto-hakukohde-${hakukohde.oid}`}>
      <Typography
        variant="h4"
        component="h3"
        sx={{ paddingLeft: 1, paddingY: 2 }}
      >
        <HakutoiveTitle
          hakutoiveNumero={hakukohde.hakutoiveNumero}
          hakukohde={hakukohde}
        />
      </Typography>
      {hakukohde.kokeet?.map((koe) => {
        return (
          <Box key={koe.tunniste} sx={{ paddingBottom: 2 }}>
            <KokeenPistesyotto
              koe={koe}
              hakukohde={hakukohde}
              hakija={hakija}
              pistesyottoActorRef={pistesyottoActorRef}
              disabled={disabled}
            />
          </Box>
        );
      })}
    </Box>
  );
};
