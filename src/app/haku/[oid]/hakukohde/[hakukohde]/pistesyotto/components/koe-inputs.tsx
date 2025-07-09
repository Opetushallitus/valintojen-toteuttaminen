'use client';

import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import {
  HakukohdePistesyottoActorRef,
  useKoePistetiedot,
  usePistesyottoActorRef,
} from '../lib/hakukohde-pistesyotto-state';
import { useTranslations } from '@/lib/localization/useTranslations';
import { KoeInputsStateless } from '@/components/koe-inputs-stateless';

type KoeInputsProps = {
  hakemusOid: string;
  koe: ValintakoeAvaimet;
  pistesyottoActorRef: HakukohdePistesyottoActorRef;
  naytaVainLaskentaanVaikuttavat?: boolean;
  disabled?: boolean;
};

export const KoeInputs = ({
  hakemusOid,
  koe,
  pistesyottoActorRef,
  naytaVainLaskentaanVaikuttavat,
  disabled,
}: KoeInputsProps) => {
  const { t } = useTranslations();
  const { onKoeChange, isUpdating } =
    usePistesyottoActorRef(pistesyottoActorRef);

  const { arvo, osallistuminen } = useKoePistetiedot(pistesyottoActorRef, {
    hakemusOid,
    koeTunniste: koe.tunniste,
  });

  return (
    <KoeInputsStateless
      hakemusOid={hakemusOid}
      koe={koe}
      disabled={disabled || isUpdating}
      osallistuminen={osallistuminen}
      onChange={onKoeChange}
      arvo={arvo}
      t={t}
      naytaVainLaskentaanVaikuttavat={naytaVainLaskentaanVaikuttavat}
    />
  );
};
