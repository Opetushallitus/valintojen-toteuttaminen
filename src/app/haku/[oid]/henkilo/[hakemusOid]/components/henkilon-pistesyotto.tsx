'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, Divider, Typography } from '@mui/material';
import { isEmpty } from 'remeda';
import { KoeInputs } from '@/app/components/koe-inputs';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { usePistesyottoState } from '@/app/lib/state/pistesyotto-state';
import { HakijaInfo } from '@/app/lib/types/ataru-types';
import useToaster from '@/app/hooks/useToaster';
import { useMemo } from 'react';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { HakutoiveTitle } from './hakutoive-title';
import { Range } from '@/app/components/range';

const KokeenPistesyotto = ({
  hakija,
  koe,
  hakukohde,
}: {
  hakija: HakijaInfo;
  koe: ValintakoeAvaimet;
  hakukohde: HenkilonHakukohdeTuloksilla;
}) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const matchingKoePisteet = hakukohde.pisteet?.find(
    (p) => p.tunniste === koe.tunniste,
  );

  const pistetiedot = useMemo(
    () => [
      {
        ...hakija,
        valintakokeenPisteet: matchingKoePisteet ? [matchingKoePisteet] : [],
      },
    ],
    [hakija, matchingKoePisteet],
  );

  const {
    actorRef: pistesyottoActorRef,
    isUpdating,
    isDirty,
    savePistetiedot,
  } = usePistesyottoState({
    hakuOid: hakukohde.hakuOid,
    hakukohdeOid: hakukohde.oid,
    pistetiedot,
    addToast,
  });

  useConfirmChangesBeforeNavigation(isDirty);

  const labelId = `${koe.tunniste}_label`;

  return (
    <>
      <Box sx={{ paddingLeft: 1, paddingBottom: 1 }}>
        <OphTypography variant="label" id={labelId}>
          {koe.kuvaus} <Range min={koe.min} max={koe.max} />
        </OphTypography>
      </Box>
      <Divider orientation="horizontal" />
      <Box
        component="section"
        sx={{
          display: 'flex',
          gap: 2,
          paddingLeft: 1,
          marginTop: 1.5,
          alignItems: 'flex-start',
        }}
        aria-labelledby={labelId}
      >
        <KoeInputs
          hakemusOid={hakija.hakemusOid}
          koe={koe}
          pistesyottoActorRef={pistesyottoActorRef}
        />
        <OphButton
          variant="contained"
          loading={isUpdating}
          onClick={() => {
            savePistetiedot();
          }}
        >
          {t('yleinen.tallenna')}
        </OphButton>
      </Box>
    </>
  );
};

export const HenkilonPistesyotto = ({
  hakija,
  hakukohteet,
}: {
  hakija: HakijaInfo;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
}) => {
  const { t } = useTranslations();
  const hakukohteetKokeilla = hakukohteet?.filter(
    (hakukohde) => !isEmpty(hakukohde.kokeet ?? []),
  );

  return isEmpty(hakukohteetKokeilla) ? null : (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h3">{t('henkilo.pistesyotto')}</Typography>
      {hakukohteetKokeilla.map((hakukohde) => {
        return (
          <Box key={hakukohde.oid}>
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
                  />
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};
