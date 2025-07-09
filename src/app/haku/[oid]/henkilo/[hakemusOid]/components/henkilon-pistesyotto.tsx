'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Typography } from '@mui/material';
import {
  filter,
  flatMap,
  isEmpty,
  isNonNullish,
  pipe,
  prop,
  uniqueBy,
} from 'remeda';
import { OphButton } from '@opetushallitus/oph-design-system';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import useToaster from '@/hooks/useToaster';
import { useCallback, useMemo } from 'react';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { HakutoiveTitle } from '@/components/hakutoive-title';
import { useHaunParametrit } from '@/lib/valintalaskentakoostepalvelu/useHaunParametrit';
import { GenericEvent } from '@/lib/common';
import { ValintakokeenPisteet } from '@/lib/types/laskenta-types';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import {
  HenkilonPistesyottoActorRef,
  useHenkilonPistesyottoState,
} from '../lib/henkilon-pistesyotto-state';
import { KokeenPistesyotto } from './kokeen-pistesyotto';

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
  lastModified,
}: {
  hakuOid: string;
  hakija: HakijaInfo;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
  lastModified?: string;
  refetchPisteet: (options?: RefetchOptions) => Promise<
    QueryObserverResult<
      {
        lastModified?: string;
        pisteet: Record<string, Array<ValintakokeenPisteet>>;
      },
      Error
    >
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

  const pistetiedot = useMemo(() => {
    return pipe(
      hakukohteet,
      flatMap((hakukohde) => hakukohde.pisteet),
      filter(isNonNullish),
      uniqueBy(prop('tunniste')),
    );
  }, [hakukohteet]);

  const hakukohteetKokeilla = useMemo(() => {
    return hakukohteet?.filter((hakukohde) => !isEmpty(hakukohde.kokeet ?? []));
  }, [hakukohteet]);

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
    pistetiedot,
    valintakokeet: kokeet,
    lastModified,
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
