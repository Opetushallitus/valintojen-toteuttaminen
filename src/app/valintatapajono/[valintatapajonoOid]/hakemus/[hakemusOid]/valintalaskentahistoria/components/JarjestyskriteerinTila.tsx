import { useTranslations } from '@/lib/localization/useTranslations';
import { JarjestyskriteeriModel } from '@/lib/types/laskenta-types';
import { mapKeys } from 'remeda';
import { NDASH } from '@/lib/constants';

// Näytetään järjestyskriteerin tulokseen tallennettu tila. Historiasta tilaa ei voi päätellä, koska
// valintalaskenta voi muuttaa laskimen tilaa (esim. edellisen valinnanvaiheen hylkäys) ja
// virkailija voi muokata sitä käsin, eikä historia päivity.
export const JarjestyskriteerinTila = ({
  tulos,
}: {
  tulos?: JarjestyskriteeriModel;
}) => {
  const { t, translateEntity } = useTranslations();
  if (!tulos) {
    return NDASH;
  }
  // Kuvauksen kieliavaimet ovat isoilla kirjaimilla (FI, SV, EN)
  const kuvaus = translateEntity(
    mapKeys(tulos.kuvaus ?? {}, (kieli) => kieli.toLowerCase()),
  );

  return (
    <span>
      {t(`tuloksenTila.${tulos.tila}`)}
      {kuvaus && ` ${NDASH} ${kuvaus}`}
    </span>
  );
};
