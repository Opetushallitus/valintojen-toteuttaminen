import { isObject } from '@/lib/common';
import {
  ValintalaskennanTulosValinnanvaiheModel,
  Valintalaskentahistoria,
  ValintalaskentahistoriaTila,
} from '@/lib/types/laskenta-types';

// Avainlistat ja kuvaukset ovat pidempiä kuin tooltipin oletusleveyteen (300px) mahtuu
export const TOOLTIP_MAX_WIDTH = '800px';

export const formatArvo = (arvo: unknown) =>
  isObject(arvo) ? JSON.stringify(arvo) : String(arvo);

export const NIMETYT_ARVOFUNKTIOT = new Set([
  'Nimetty lukuarvo',
  'Nimetty totuusarvo',
]);

// Kerätään funktiopuusta nimettyjen arvojen tulokset
export const collectNimetytArvot = (
  historia: Valintalaskentahistoria,
): Array<Valintalaskentahistoria> => [
  ...(NIMETYT_ARVOFUNKTIOT.has(historia.funktio) && historia.tulos != null
    ? [historia]
    : []),
  ...(historia.historiat ?? []).flatMap(collectNimetytArvot),
];

// Valitaan näytettävä tila samoin kuin laskenta (palautettavaTila valintaperusteet-laskennassa):
// ensimmäinen virhe, muuten ensimmäinen hylkäys, muuten hyväksyttävissä.
// Tilat eivät ole aikajärjestyksessä, vaan ne on kerätty alifunktioiden tuloksista.
export const palautettavaTila = (
  tilat: Array<ValintalaskentahistoriaTila>,
): ValintalaskentahistoriaTila =>
  tilat.find((tila) => tila.tilatyyppi === 'VIRHE') ??
  tilat.find((tila) => tila.tilatyyppi === 'HYLATTY') ?? {
    tilatyyppi: 'HYVAKSYTTAVISSA',
  };

export type JononSijainti = {
  hakukohdeOid: string;
  valinnanvaiheOid: string;
};

// Etsitään hakemuksen valintalaskennan tuloksista hakukohde ja valinnanvaihe, joihin valintatapajono kuuluu.
// Valintalaskenta tallentaa valintaperusteiden OIDit sellaisinaan, joten niillä voi linkittää valintaperusteisiin.
export const findJononHakukohdeJaValinnanvaihe = (
  tulokset: Record<string, Array<ValintalaskennanTulosValinnanvaiheModel>>,
  valintatapajonoOid: string,
): JononSijainti | undefined => {
  for (const [hakukohdeOid, valinnanvaiheet] of Object.entries(tulokset)) {
    const valinnanvaihe = valinnanvaiheet.find((vaihe) =>
      vaihe.valintatapajonot?.some(
        (jono) => jono.valintatapajonooid === valintatapajonoOid,
      ),
    );
    if (valinnanvaihe) {
      return { hakukohdeOid, valinnanvaiheOid: valinnanvaihe.valinnanvaiheoid };
    }
  }
  return undefined;
};
