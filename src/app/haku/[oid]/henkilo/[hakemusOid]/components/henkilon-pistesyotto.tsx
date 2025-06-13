'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Divider, Typography } from '@mui/material';
import { isEmpty } from 'remeda';
import { KoeInputs } from '@/components/koe-inputs';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { usePistesyottoState } from '@/lib/state/pistesyotto-state';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import useToaster from '@/hooks/useToaster';
import { useCallback, useMemo } from 'react';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { HakutoiveTitle } from '@/components/hakutoive-title';
import { Range } from '@/components/range';
import { getHakukohdeFullName } from '@/lib/kouta/kouta-service';
import { useHaunParametrit } from '@/lib/valintalaskentakoostepalvelu/useHaunParametrit';
import { GenericEvent } from '@/lib/common';

const KokeenPistesyotto = ({
  hakija,
  koe,
  hakukohde,
}: {
  hakija: HakijaInfo;
  koe: ValintakoeAvaimet;
  hakukohde: HenkilonHakukohdeTuloksilla;
}) => {
  const { t, translateEntity } = useTranslations();

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

  const onEvent = useCallback(
    (event: GenericEvent) => {
      addToast(event);
    },
    [addToast],
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
    valintakokeet: koe,
    onEvent,
  });

  useConfirmChangesBeforeNavigation(isDirty);

  const { data: haunParametrit } = useHaunParametrit({
    hakuOid: hakukohde.hakuOid,
  });

  const labelId = `${koe.tunniste}_label_${hakukohde.oid}`;

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
        aria-label={t('henkilo.koe-tunnus-hakukohde', {
          koe: koe.kuvaus,
          hakukohde: getHakukohdeFullName(hakukohde, translateEntity),
        })}
      >
        <KoeInputs
          hakemusOid={hakija.hakemusOid}
          koe={koe}
          pistesyottoActorRef={pistesyottoActorRef}
          disabled={hakukohde.readOnly || !haunParametrit.pistesyottoEnabled}
        />
        {!hakukohde.readOnly && (
          <OphButton
            variant="contained"
            loading={isUpdating}
            disabled={!haunParametrit.pistesyottoEnabled}
            onClick={() => {
              savePistetiedot();
            }}
          >
            {t('yleinen.tallenna')}
          </OphButton>
        )}
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
          <Box
            key={hakukohde.oid}
            data-test-id={`henkilo-pistesyotto-hakukohde-${hakukohde.oid}`}
          >
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
