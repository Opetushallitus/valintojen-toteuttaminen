import { Hakemus } from '@/lib/ataru/ataru-types';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/lib/types/laskenta-types';
import { indexBy, isNonNullish, prop } from 'remeda';

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

export const augmentPisteetWithHakemukset = (
  hakemukset: Array<Hakemus>,
  pistetiedot: Array<{
    hakemusOid: string;
    valintakokeenPisteet: Array<ValintakokeenPisteet>;
  }>,
): Array<HakemuksenPistetiedot> => {
  const hakemuksetIndexed = indexBy(hakemukset, prop('hakemusOid'));

  return pistetiedot
    .map((p) => {
      const hakemus = hakemuksetIndexed[p.hakemusOid];

      if (!hakemus) {
        console.warn(
          `Hakemus-OIDille ${p.hakemusOid} löytyi pistetieto, mutta ei hakemusta Atarusta!`,
        );
        return null;
      }

      return {
        hakemusOid: hakemus.hakemusOid,
        hakijaOid: hakemus.hakijaOid,
        hakijanNimi: hakemus.hakijanNimi,
        henkilotunnus: hakemus.henkilotunnus,
        etunimet: hakemus.etunimet,
        sukunimi: hakemus.sukunimi,
        valintakokeenPisteet: p.valintakokeenPisteet,
      };
    })
    .filter(isNonNullish);
};
