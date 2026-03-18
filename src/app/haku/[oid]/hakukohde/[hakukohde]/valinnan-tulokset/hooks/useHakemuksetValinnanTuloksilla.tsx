'use client';
import {
  Hakemus,
  MaksunTila,
  Maksuvelvollisuus,
} from '@/lib/ataru/ataru-types';
import {
  HakukohteenLukuvuosimaksut,
  HakukohteenValinnanTuloksetData,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { useMemo } from 'react';
import { indexBy } from 'remeda';

export const useHakemuksetValinnanTuloksilla = ({
  hakemukset,
  valinnanTulokset,
  lukuvuosimaksut,
}: {
  hakemukset: Array<Hakemus>;
  valinnanTulokset: HakukohteenValinnanTuloksetData;
  lukuvuosimaksut: HakukohteenLukuvuosimaksut;
}): Array<HakemuksenValinnanTulos> => {
  return useMemo(() => {
    const lukuvuosimaksutIndexed = indexBy(lukuvuosimaksut, (m) => m.personOid);

    return hakemukset.map((hakemus) => {
      const valinnanTulos = valinnanTulokset.data[hakemus.hakemusOid];
      const maksunTila =
        hakemus.maksuvelvollisuus === Maksuvelvollisuus.MAKSUVELVOLLINEN &&
        (lukuvuosimaksutIndexed[hakemus.hakijaOid]?.maksuntila ??
          MaksunTila.MAKSAMATTA);

      return {
        hakijaOid: hakemus.hakijaOid,
        hakemusOid: hakemus.hakemusOid,
        hakijanNimi: hakemus.hakijanNimi,
        maksunTila: maksunTila || undefined,
        ...(valinnanTulos
          ? {
              hakukohdeOid: valinnanTulos.hakukohdeOid,
              valintatapajonoOid: valinnanTulos.valintatapajonoOid,
              valinnanTila: valinnanTulos.valinnantila,
              vastaanottoTila: valinnanTulos.vastaanottotila,
              ilmoittautumisTila: valinnanTulos.ilmoittautumistila,
              ehdollisestiHyvaksyttavissa:
                valinnanTulos.ehdollisestiHyvaksyttavissa,
              ehdollisenHyvaksymisenEhtoKoodi:
                valinnanTulos.ehdollisenHyvaksymisenEhtoKoodi,
              ehdollisenHyvaksymisenEhtoFI:
                valinnanTulos.ehdollisenHyvaksymisenEhtoFI,
              ehdollisenHyvaksymisenEhtoSV:
                valinnanTulos.ehdollisenHyvaksymisenEhtoSV,
              ehdollisenHyvaksymisenEhtoEN:
                valinnanTulos.ehdollisenHyvaksymisenEhtoEN,
              valinnanTilanKuvausFI:
                valinnanTulos.valinnantilanKuvauksenTekstiFI,
              valinnanTilanKuvausSV:
                valinnanTulos.valinnantilanKuvauksenTekstiSV,
              valinnanTilanKuvausEN:
                valinnanTulos.valinnantilanKuvauksenTekstiEN,
              julkaistavissa: valinnanTulos.julkaistavissa,
              hyvaksyttyVarasijalta: valinnanTulos.hyvaksyttyVarasijalta,
              hyvaksyPeruuntunut: valinnanTulos.hyvaksyPeruuntunut,
              vastaanottoDeadline: valinnanTulos.vastaanottoDeadline,
              vastaanottoDeadlineMennyt:
                valinnanTulos.vastaanottoDeadlineMennyt,
            }
          : {}),
      };
    });
  }, [hakemukset, lukuvuosimaksut, valinnanTulokset]);
};
