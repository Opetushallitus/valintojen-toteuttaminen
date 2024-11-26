import { ValinnanTulosModel } from "@/app/lib/valinta-tulos-service";

export const hakemusValinnanTulosFixture = ({hakukohdeOid, valintatapajonoOid, hakemusOid, henkiloOid, julkaistavissa, vastaanottotila, ilmoittautumistila, valinnantila}: ValinnanTulosModel) => [
    {
        "valinnantulos": {
            "hakukohdeOid": hakukohdeOid,
            "valintatapajonoOid": valintatapajonoOid,
            "hakemusOid": hakemusOid,
            "henkiloOid": henkiloOid,
            "valinnantila": valinnantila,
            "ehdollisestiHyvaksyttavissa": false,
            "julkaistavissa": julkaistavissa,
            "hyvaksyttyVarasijalta": false,
            "hyvaksyPeruuntunut": false,
            "vastaanottotila": vastaanottotila,
            "ilmoittautumistila": ilmoittautumistila,
        },
        "tilaHistoria": []
    }
]