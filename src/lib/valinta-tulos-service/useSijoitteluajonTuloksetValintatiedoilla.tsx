import { indexBy } from 'remeda';
import { Hakemus, MaksunTila, Maksuvelvollisuus } from '../ataru/ataru-types';
import {
  SijoitteluajonTuloksetValintatiedoilla,
  SijoitteluajonValintatapajonoValintatiedoilla,
  SijoittelunHakemusValintatiedoilla,
} from '../types/sijoittelu-types';
import { SijoitteluajonTuloksetWithValintaEsitysResponseData } from './valinta-tulos-types';
import { useMemo } from 'react';

type SelectSijoitteluajonTuloksetValintatiedoillaProps = {
  hakemukset: Array<Hakemus>;
  sijoittelunTulokset: SijoitteluajonTuloksetWithValintaEsitysResponseData | null;
};

export const selectSijoitteluajonTuloksetValintatiedoilla = ({
  hakemukset,
  sijoittelunTulokset,
}: SelectSijoitteluajonTuloksetValintatiedoillaProps) => {
  if (!sijoittelunTulokset) {
    return null;
  }
  const hakemuksetIndexed = indexBy(hakemukset, (h) => h.hakemusOid);
  const lukuvuosimaksutIndexed = indexBy(
    sijoittelunTulokset.lukuvuosimaksut,
    (m) => m.personOid,
  );
  const lahetetytKirjeetIndexed = indexBy(
    sijoittelunTulokset.kirjeLahetetty,
    (k) => k.henkiloOid,
  );

  const sijoitteluajonTulokset: Array<SijoitteluajonValintatapajonoValintatiedoilla> =
    sijoittelunTulokset.sijoittelunTulokset.valintatapajonot.map((jono) => {
      const valintatuloksetIndexed = indexBy(
        sijoittelunTulokset.valintatulokset.filter(
          (vt) => vt.valintatapajonoOid === jono.oid,
        ),
        (vt) => vt.hakemusOid,
      );

      let hasNegativePisteet: boolean = false;

      const hakemukset: Array<SijoittelunHakemusValintatiedoilla> =
        jono.hakemukset.map((h) => {
          const hakemus = hakemuksetIndexed[h.hakemusOid];
          const valintatulos = valintatuloksetIndexed[h.hakemusOid];
          const maksunTila =
            hakemus.maksuvelvollisuus === Maksuvelvollisuus.MAKSUVELVOLLINEN &&
            (lukuvuosimaksutIndexed[h.hakijaOid]?.maksuntila ??
              MaksunTila.MAKSAMATTA);
          if (h.pisteet < 0) {
            hasNegativePisteet = true;
          }

          return {
            hakijaOid: h.hakijaOid,
            hakemusOid: h.hakemusOid,
            hakijanNimi: hakemus?.hakijanNimi,
            pisteet: h.pisteet,
            tila: h.tila,
            valintatapajonoOid: h.valintatapajonoOid,
            hyvaksyttyHakijaryhmista: h.hyvaksyttyHakijaryhmista,
            varasijanNumero: h.varasijanNumero,
            jonosija: h.jonosija,
            tasasijaJonosija: h.tasasijaJonosija,
            hakutoive: h.prioriteetti,
            ilmoittautumisTila: valintatulos.ilmoittautumistila,
            julkaistavissa: valintatulos.julkaistavissa,
            vastaanottotila: valintatulos.vastaanottotila,
            maksunTila: maksunTila || undefined,
            ehdollisestiHyvaksyttavissa:
              valintatulos.ehdollisestiHyvaksyttavissa,
            hyvaksyttyVarasijalta: valintatulos.hyvaksyttyVarasijalta,
            onkoMuuttunutViimeSijoittelussa: h.onkoMuuttunutViimeSijoittelussa,
            ehdollisenHyvaksymisenEhtoKoodi:
              valintatulos.ehdollisenHyvaksymisenEhtoKoodi,
            ehdollisenHyvaksymisenEhtoFI:
              valintatulos.ehdollisenHyvaksymisenEhtoFI,
            ehdollisenHyvaksymisenEhtoSV:
              valintatulos.ehdollisenHyvaksymisenEhtoSV,
            ehdollisenHyvaksymisenEhtoEN:
              valintatulos.ehdollisenHyvaksymisenEhtoEN,
            vastaanottoDeadlineMennyt: valintatulos.vastaanottoDeadlineMennyt,
            vastaanottoDeadline: valintatulos.vastaanottoDeadline,
            hyvaksyttyHarkinnanvaraisesti:
              valintatulos.hyvaksyttyHarkinnanvaraisesti,
            hyvaksyPeruuntunut: valintatulos.hyvaksyPeruuntunut,
            hyvaksymiskirjeLahetetty:
              lahetetytKirjeetIndexed[h.hakijaOid]?.kirjeLahetetty,
            siirtynytToisestaValintatapajonosta:
              h.siirtynytToisestaValintatapajonosta,
          };
        });
      hakemukset.sort((a, b) =>
        a.jonosija === b.jonosija
          ? a.tasasijaJonosija - b.tasasijaJonosija
          : a.jonosija - b.jonosija,
      );
      hakemukset
        .filter(function (hakemus) {
          return (
            hakemus.tila === 'HYVAKSYTTY' ||
            hakemus.tila === 'VARASIJALTA_HYVAKSYTTY' ||
            hakemus.tila === 'VARALLA'
          );
        })
        .forEach((hakemus, i) => (hakemus.sija = i + 1));

      return {
        oid: jono.oid,
        nimi: jono.nimi,
        hakemukset,
        hasNegativePisteet,
        prioriteetti: jono.prioriteetti,
        accepted: sijoittelunTulokset.valintaesitys?.find(
          (e) => e.valintatapajonoOid === jono.oid,
        )?.hyvaksytty,
        varasijataytto: !jono.eiVarasijatayttoa,
        aloituspaikat: jono.aloituspaikat,
        alkuperaisetAloituspaikat: jono.alkuperaisetAloituspaikat,
        tasasijasaanto: jono.tasasijasaanto,
      };
    });

  return {
    sijoitteluajoId: sijoittelunTulokset.sijoittelunTulokset.sijoitteluajoId,
    valintatapajonot: sijoitteluajonTulokset,
    lastModified: sijoittelunTulokset.lastModified,
  };
};

export const useSijoitteluajonTuloksetValintatiedoilla = ({
  hakemukset,
  sijoittelunTulokset,
}: {
  hakemukset: Array<Hakemus>;
  sijoittelunTulokset: SijoitteluajonTuloksetWithValintaEsitysResponseData | null;
}): SijoitteluajonTuloksetValintatiedoilla | null => {
  return useMemo(
    () =>
      selectSijoitteluajonTuloksetValintatiedoilla({
        hakemukset,
        sijoittelunTulokset,
      }),
    [sijoittelunTulokset, hakemukset],
  );
};
