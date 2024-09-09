import {
  ValintakoeOsallistuminen,
  ValintakokeenPisteet,
} from '@/app/lib/types/laskenta-types';

export const isNotPartOfThisHakukohde = (pisteet: ValintakokeenPisteet) => {
  const osallistuminen = pisteet.osallistuminen;
  return (
    osallistuminen === ValintakoeOsallistuminen.EI_KUTSUTTU ||
    osallistuminen === ValintakoeOsallistuminen.TOISELLA_HAKEMUKSELLA ||
    osallistuminen === ValintakoeOsallistuminen.TOISESSA_HAKUTOIVEESSA
  );
};

export const NOT_READABLE_REASON_MAP = {
  [ValintakoeOsallistuminen.EI_KUTSUTTU]: 'pistesyotto.eiKutsuttu',
  [ValintakoeOsallistuminen.TOISELLA_HAKEMUKSELLA]:
    'pistesyotto.toisellaHakemuksella',
  [ValintakoeOsallistuminen.TOISESSA_HAKUTOIVEESSA]:
    'pistesyotto.toisessaHakutoiveessa',
  [ValintakoeOsallistuminen.EI_OSALLISTUNUT]: '',
  [ValintakoeOsallistuminen.MERKITSEMATTA]: '',
  [ValintakoeOsallistuminen.OSALLISTUI]: '',
  [ValintakoeOsallistuminen.EI_VAADITA]: '',
} as const;
