import { KoeInputs, KoeInputsProps } from '@/components/koe-inputs';
import { usePisteSyottoSearchParams } from '../hooks/usePisteSyottoSearch';

export const PisteSyottoKoeInputs = ({
  hakemusOid,
  koe,
  pistesyottoActorRef,
}: KoeInputsProps) => {
  const { naytaVainLaskentaanVaikuttavat } = usePisteSyottoSearchParams();

  return (
    <KoeInputs
      hakemusOid={hakemusOid}
      koe={koe}
      pistesyottoActorRef={pistesyottoActorRef}
      naytaVainLaskentaanVaikuttavat={naytaVainLaskentaanVaikuttavat}
    />
  );
};
