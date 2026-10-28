import { useTranslations } from '@/lib/localization/useTranslations';
import { ValintalaskentahistoriaTila } from '@/lib/types/laskenta-types';
import { mapKeys } from 'remeda';
import { palautettavaTila } from '../lib/valintalaskentahistoriaUtils';
import { NDASH } from '@/lib/constants';

export const JarjestyskriteerinTila = ({
  tilat,
}: {
  tilat: Array<ValintalaskentahistoriaTila>;
}) => {
  const { t, translateEntity } = useTranslations();
  const tila = palautettavaTila(tilat);
  // Kuvauksen kieliavaimet ovat isoilla kirjaimilla (FI, SV, EN)
  const kuvaus = translateEntity(
    mapKeys(tila.kuvaus ?? {}, (kieli) => kieli.toLowerCase()),
  );

  return (
    <span>
      {t(`tuloksenTila.${tila.tilatyyppi}`)}
      {kuvaus && ` ${NDASH} ${kuvaus}`}
    </span>
  );
};
