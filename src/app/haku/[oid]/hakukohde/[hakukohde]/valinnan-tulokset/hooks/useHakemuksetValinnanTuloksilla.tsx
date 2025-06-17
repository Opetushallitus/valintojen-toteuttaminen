'use client';
import { Hakemus } from '@/lib/ataru/ataru-types';
import { HakukohteenValinnanTuloksetData } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { useMemo } from 'react';

export const useHakemuksetValinnanTuloksilla = ({
  hakemukset,
  valinnanTulokset,
}: {
  hakemukset: Array<Hakemus>;
  valinnanTulokset: HakukohteenValinnanTuloksetData;
}): Array<HakemuksenValinnanTulos> => {
  return useMemo(
    () =>
      hakemukset.map((hakemus) => {
        const valinnanTulos = valinnanTulokset.data[hakemus.hakemusOid];
        return {
          hakijaOid: hakemus.hakijaOid,
          hakemusOid: hakemus.hakemusOid,
          hakijanNimi: hakemus.hakijanNimi,
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
      }),
    [hakemukset, valinnanTulokset],
  );
};
