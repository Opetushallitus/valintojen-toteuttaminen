import { ValinnanTulosModel } from "@/lib/valinta-tulos-service/valinta-tulos-types";

export const hakemusValinnanTulosFixture = (valinnanTulokset: Array<ValinnanTulosModel>) => 
    valinnanTulokset.map(vt => (
    {
        "valinnantulos": {
            "hakukohdeOid": vt.hakukohdeOid,
            "valintatapajonoOid": vt.valintatapajonoOid,
            "hakemusOid": vt.hakemusOid,
            "henkiloOid": vt.henkiloOid,
            "valinnantila": vt.valinnantila,
            "ehdollisestiHyvaksyttavissa": false,
            "julkaistavissa": vt.julkaistavissa,
            "hyvaksyttyVarasijalta": false,
            "hyvaksyPeruuntunut": false,
            "vastaanottotila": vt.vastaanottotila,
            "ilmoittautumistila": vt.ilmoittautumistila,
        },
        "tilaHistoria": []
    }));