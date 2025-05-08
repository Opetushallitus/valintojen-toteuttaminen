import { ValinnanTila, VastaanottoTila } from './types/sijoittelu-types';
import { HakemuksenValinnanTulos } from './valinta-tulos-service/valinta-tulos-types';

export const isValidValinnanTila = (
  hakemus: Pick<HakemuksenValinnanTulos, 'valinnanTila' | 'vastaanottoTila'>,
) => {
  const { valinnanTila, vastaanottoTila = VastaanottoTila.KESKEN } = hakemus;
  return (
    (!valinnanTila && vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === ValinnanTila.PERUNUT &&
      vastaanottoTila === VastaanottoTila.PERUNUT) ||
    (valinnanTila === ValinnanTila.HYLATTY &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === ValinnanTila.VARALLA &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === ValinnanTila.PERUUNTUNUT &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === ValinnanTila.PERUUNTUNUT &&
      vastaanottoTila === VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN) ||
    (valinnanTila === ValinnanTila.PERUNUT &&
      vastaanottoTila === VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA) ||
    (valinnanTila === ValinnanTila.VARASIJALTA_HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === ValinnanTila.VARASIJALTA_HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT) ||
    (valinnanTila === ValinnanTila.VARASIJALTA_HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.VASTAANOTTANUT_SITOVASTI) ||
    (valinnanTila === ValinnanTila.HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.KESKEN) ||
    (valinnanTila === ValinnanTila.HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT) ||
    (valinnanTila === ValinnanTila.HYVAKSYTTY &&
      vastaanottoTila === VastaanottoTila.VASTAANOTTANUT_SITOVASTI) ||
    (valinnanTila === ValinnanTila.PERUNUT &&
      vastaanottoTila === VastaanottoTila.PERUNUT) ||
    (valinnanTila === ValinnanTila.PERUUTETTU &&
      vastaanottoTila === VastaanottoTila.PERUUTETTU)
  );
};
