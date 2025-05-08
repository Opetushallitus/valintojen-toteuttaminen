import { SijoittelunTila, VastaanottoTila } from './types/sijoittelu-types';
import { HakemuksenValinnanTulos } from './valinta-tulos-service/valinta-tulos-types';

export const isValidValinnanTila = (
  hakemus: Pick<HakemuksenValinnanTulos, 'valinnanTila' | 'vastaanottoTila'>,
) => {
  const { valinnanTila, vastaanottoTila = VastaanottoTila.KESKEN } = hakemus;
  return (
    (!valinnanTila && vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === SijoittelunTila.PERUNUT &&
      vastaanottoTila === VastaanottoTila.PERUNUT) ||
    (valinnanTila === SijoittelunTila.HYLATTY &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === SijoittelunTila.VARALLA &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === SijoittelunTila.PERUUNTUNUT &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === SijoittelunTila.PERUUNTUNUT &&
      vastaanottoTila === VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN) ||
    (valinnanTila === SijoittelunTila.PERUNUT &&
      vastaanottoTila === VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA) ||
    (valinnanTila === SijoittelunTila.VARASIJALTA_HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === SijoittelunTila.VARASIJALTA_HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT) ||
    (valinnanTila === SijoittelunTila.VARASIJALTA_HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.VASTAANOTTANUT_SITOVASTI) ||
    (valinnanTila === SijoittelunTila.HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === SijoittelunTila.HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT) ||
    (valinnanTila === SijoittelunTila.HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.VASTAANOTTANUT_SITOVASTI) ||
    (valinnanTila === SijoittelunTila.PERUNUT &&
      vastaanottoTila === VastaanottoTila.PERUNUT) ||
    (valinnanTila === SijoittelunTila.PERUUTETTU &&
      vastaanottoTila === VastaanottoTila.PERUUTETTU)
  );
};
