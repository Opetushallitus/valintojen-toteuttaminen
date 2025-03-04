import {
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/lib/types/laskenta-types';

export const isNotPartOfThisHakukohde = (
  pisteet: ValintakokeenPisteet | undefined,
) => {
  if (!pisteet) {
    return false;
  }
  const osallistuminen = pisteet.osallistuminen;
  return (
    osallistuminen === ValintakoeOsallistuminenTulos.EI_KUTSUTTU ||
    osallistuminen === ValintakoeOsallistuminenTulos.TOISELLA_HAKEMUKSELLA ||
    osallistuminen === ValintakoeOsallistuminenTulos.TOISESSA_HAKUTOIVEESSA
  );
};

export const NOT_READABLE_REASON_MAP = {
  [ValintakoeOsallistuminenTulos.EI_KUTSUTTU]: 'pistesyotto.eiKutsuttu',
  [ValintakoeOsallistuminenTulos.TOISELLA_HAKEMUKSELLA]:
    'pistesyotto.toisellaHakemuksella',
  [ValintakoeOsallistuminenTulos.TOISESSA_HAKUTOIVEESSA]:
    'pistesyotto.toisessaHakutoiveessa',
  [ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT]: '',
  [ValintakoeOsallistuminenTulos.MERKITSEMATTA]: '',
  [ValintakoeOsallistuminenTulos.OSALLISTUI]: '',
  [ValintakoeOsallistuminenTulos.EI_VAADITA]: '',
} as const;
