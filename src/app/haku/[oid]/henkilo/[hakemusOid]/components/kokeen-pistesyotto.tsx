'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Divider } from '@mui/material';
import { isNullish } from 'remeda';
import { KoeInputsStateless } from '@/components/koe-inputs-stateless';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { Range } from '@/components/range';
import { getHakukohdeFullName } from '@/lib/kouta/kouta-service';
import {
  HenkilonPistesyottoActorRef,
  useHenkilonKoePistetiedot,
  useHenkilonPistesyottoActorRef,
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

export const KokeenPistesyotto = ({
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
  const hideInputs = isNullish(matchingKoePisteet);

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
