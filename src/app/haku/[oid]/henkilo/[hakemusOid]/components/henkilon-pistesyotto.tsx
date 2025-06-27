'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Divider, Typography } from '@mui/material';
import {
  filter,
  flatMap,
  isEmpty,
  isNonNullish,
  isNullish,
  pipe,
  prop,
  uniqueBy,
} from 'remeda';
import { KoeInputsStateless } from '@/components/koe-inputs';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
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
import {
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/lib/types/laskenta-types';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import {
  HenkilonPistesyottoActorRef,
  useHenkilonKoePistetiedot,
  useHenkilonPistesyottoActorRef,
  useHenkilonPistesyottoState,
} from '../lib/henkilon-pistesyotto-state';

const KoeInputs = ({
  hakemusOid,
  koe,
  pistesyottoActorRef,
  disabled,
}: {
  hakemusOid: string;
  koe: ValintakoeAvaimet;
  pistesyottoActorRef: HenkilonPistesyottoActorRef;
  disabled: boolean;
}) => {
  const { t } = useTranslations();
  const { onKoeChange, isUpdating } =
    useHenkilonPistesyottoActorRef(pistesyottoActorRef);

  const { arvo, osallistuminen } = useHenkilonKoePistetiedot(
    pistesyottoActorRef,
    {
      koeTunniste: koe.tunniste,
    },
  );

  return (
    <KoeInputsStateless
      hakemusOid={hakemusOid}
      koe={koe}
      disabled={disabled || isUpdating}
      osallistuminen={osallistuminen}
      onChange={onKoeChange}
      arvo={arvo}
      t={t}
    />
  );
};

const KokeenPistesyotto = ({
  hakija,
  koe,
  hakukohde,
  pistesyottoActorRef,
  disabled,
}: {
  hakija: HakijaInfo;
  koe: ValintakoeAvaimet;
  hakukohde: HenkilonHakukohdeTuloksilla;
  pistesyottoActorRef: HenkilonPistesyottoActorRef;
  disabled: boolean;
}) => {
  const { t, translateEntity } = useTranslations();

  const matchingKoePisteet = hakukohde.pisteet?.find(
    (p) => p.tunniste === koe.tunniste,
  );

  const labelId = `${koe.tunniste}_label_${hakukohde.oid}`;
  const hideInputs =
    isNullish(matchingKoePisteet) ||
    matchingKoePisteet.osallistuminen ===
      ValintakoeOsallistuminenTulos.EI_KUTSUTTU;

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
        {hideInputs ? (
          <></>
        ) : (
          <KoeInputs
            hakemusOid={hakija.hakemusOid}
            koe={koe}
            pistesyottoActorRef={pistesyottoActorRef}
            disabled={disabled}
          />
        )}
      </Box>
    </>
  );
};

const HakukohteenPisteSyotto = ({
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

export const HenkilonPistesyotto = ({
  hakuOid,
  hakija,
  hakukohteet,
  refetchPisteet,
}: {
  hakuOid: string;
  hakija: HakijaInfo;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
  refetchPisteet: (
    options?: RefetchOptions,
  ) => Promise<
    QueryObserverResult<Record<string, Array<ValintakokeenPisteet>>, Error>
  >;
}) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const { data: haunParametrit } = useHaunParametrit({
    hakuOid: hakuOid,
  });

  const onEvent = useCallback(
    (event: GenericEvent) => {
      if (event.type === 'success') {
        refetchPisteet();
      }
      addToast(event);
    },
    [addToast, refetchPisteet],
  );

  const pistetiedot = useMemo(
    () =>
      pipe(
        hakukohteet,
        flatMap((hakukohde) => hakukohde.pisteet),
        filter(isNonNullish),
        uniqueBy(prop('tunniste')),
      ),
    [hakukohteet],
  );

  const hakukohteetKokeilla = useMemo(
    () => hakukohteet?.filter((hakukohde) => !isEmpty(hakukohde.kokeet ?? [])),
    [hakukohteet],
  );

  const kokeet = useMemo(
    () =>
      pipe(
        hakukohteetKokeilla,
        flatMap((hk) => hk.kokeet),
        filter(isNonNullish),
        uniqueBy(prop('tunniste')),
      ),
    [hakukohteetKokeilla],
  );

  const {
    actorRef: pistesyottoActorRef,
    isUpdating,
    isDirty,
    savePistetiedot,
  } = useHenkilonPistesyottoState({
    hakija,
    pistetiedot: pistetiedot,
    valintakokeet: kokeet,
    onEvent,
  });

  useConfirmChangesBeforeNavigation(isDirty);

  return isEmpty(hakukohteetKokeilla) ? null : (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h3">{t('henkilo.pistesyotto')}</Typography>
      {hakukohteetKokeilla.some(
        (hakukohde) =>
          !hakukohde.readOnly &&
          hakukohde.pisteet &&
          hakukohde.pisteet.length > 0,
      ) && (
        <OphButton
          sx={{ margin: '0.8rem 0' }}
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
      {hakukohteetKokeilla.map((hakukohde) => (
        <HakukohteenPisteSyotto
          key={hakukohde.oid}
          hakukohde={hakukohde}
          hakija={hakija}
          pistesyottoActorRef={pistesyottoActorRef}
          disabled={hakukohde.readOnly || !haunParametrit.pistesyottoEnabled}
        />
      ))}
    </Box>
  );
};
