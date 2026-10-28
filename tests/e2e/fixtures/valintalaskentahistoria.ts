import { Valintalaskentahistoria } from '@/lib/types/laskenta-types';
import HAKEMUKSEN_VALINTALASKENTA_TULOKSET from './hakemuksen-valintalaskenta-tulokset.json' with { type: 'json' };

export const HISTORIA_HAKUOID = '1.2.246.562.29.00000000000000045102';
export const HISTORIA_HAKEMUSOID = '1.2.246.562.11.00000000000001796027';
// Jono 2 hakukohteessa 1.2.246.562.20.00000000000000045105 (ks. hakemuksen-valintalaskenta-tulokset.json)
export const HISTORIA_HAKUKOHDEOID = '1.2.246.562.20.00000000000000045105';
export const HISTORIA_VALINNANVAIHEOID = '1709304299841-1495392252776170181';
export const HISTORIA_VALINTATAPAJONOOID = '17093042998533736417074016063604';

const juuri = (
  tulos: Valintalaskentahistoria['tulos'],
  tilat: Valintalaskentahistoria['tilat'],
  historiat: Array<Valintalaskentahistoria>,
  avaimet: Valintalaskentahistoria['avaimet'],
): Valintalaskentahistoria => ({
  funktio: `Laskenta hakemukselle (${HISTORIA_HAKEMUSOID})`,
  tulos,
  tilat,
  historiat,
  avaimet,
});

// 1. järjestyskriteeri: hyväksyttävissä, puussa nimettyjä arvoja ja avaimellisia solmuja
const ENSIMMAINEN_HISTORIA = juuri(
  12,
  [{ tilatyyppi: 'HYVAKSYTTAVISSA' }],
  [
    {
      funktio: 'Summa',
      tulos: 12,
      tilat: [{ tilatyyppi: 'HYVAKSYTTAVISSA' }],
      historiat: [
        {
          funktio: 'Nimetty lukuarvo',
          tulos: 8,
          tilat: [],
          avaimet: { nimi: 'Yhteispisteet' },
          historiat: [
            {
              funktio: 'Hae lukuarvo',
              tulos: 8,
              tilat: [],
              avaimet: { oletusarvo: null },
            },
          ],
        },
        {
          funktio: 'Nimetty totuusarvo',
          tulos: true,
          tilat: [],
          avaimet: { nimi: 'Pohjakoulutus kunnossa' },
        },
        {
          funktio: 'Hae lukuarvo',
          // Tulos 0 ei ole nimetty arvo, mutta tarkistetaan että se näkyy puussa
          tulos: 0,
          tilat: [],
          avaimet: { valintaperuste: 'lisapisteet', oletusarvo: 0 },
        },
      ],
    },
  ],
  { pohjakoulutus: '1', asiointikieli: 'fi', kieli: 'FI' },
);

// 2. järjestyskriteeri: hylätty, ei tulosta. "Pohjakoulutus kunnossa" on täysin sama kuin
// 1. järjestyskriteerissä. "Yhteispisteillä" on sama nimi ja tulos, mutta eri avaimet.
const TOINEN_HISTORIA = juuri(
  null,
  [
    { tilatyyppi: 'HYVAKSYTTAVISSA' },
    {
      tilatyyppi: 'HYLATTY',
      kuvaus: { FI: 'Pakollinen valintaperuste puuttuu' },
    },
  ],
  [
    {
      funktio: 'Hylkää',
      tulos: null,
      tilat: [
        {
          tilatyyppi: 'HYLATTY',
          kuvaus: { FI: 'Pakollinen valintaperuste puuttuu' },
        },
      ],
      historiat: [
        {
          funktio: 'Nimetty totuusarvo',
          tulos: true,
          tilat: [],
          avaimet: { nimi: 'Pohjakoulutus kunnossa' },
        },
        {
          funktio: 'Nimetty lukuarvo',
          tulos: 8,
          tilat: [],
          avaimet: { nimi: 'Yhteispisteet', valintaperuste: 'lisapisteet' },
        },
      ],
    },
  ],
  { pohjakoulutus: '1', asiointikieli: 'fi', kieli: 'FI' },
);

export const historiaResponse = (historiat: Array<Valintalaskentahistoria>) =>
  historiat.map((historia) => ({ historia: JSON.stringify(historia) }));

export const JONOSIJAHISTORIA_RESPONSE = historiaResponse([
  ENSIMMAINEN_HISTORIA,
  TOINEN_HISTORIA,
]);

// Historia, jossa ei ole avaimia eikä nimettyjä arvoja
export const TYHJA_JONOSIJAHISTORIA_RESPONSE = historiaResponse([
  juuri(5, [{ tilatyyppi: 'HYVAKSYTTAVISSA' }], [], {}),
]);

// Välissä on ei-aktiivinen järjestyskriteeri, jota laskenta ei käytä. Laskennan tuloksiin
// tallentuva prioriteetti on indeksi kaikkien järjestyskriteerien joukossa.
export const JARJESTYSKRITEERIT_RESPONSE = [
  { oid: 'jk-1', laskentakaavaId: 101, aktiivinen: true },
  { oid: 'jk-ei-aktiivinen', laskentakaavaId: 999, aktiivinen: false },
  { oid: 'jk-2', laskentakaavaId: 102, aktiivinen: true },
];

// Järjestyskriteerien laskentakaavojen nimet. Laskennan tuloksiin tallentuu järjestyskriteerin
// nimeksi sen laskentakaavan nimi.
export const LASKENTAKAAVOJEN_NIMET: Record<number, string> = {
  101: 'Yhteispisteet',
  102: 'Pakollisuus',
  103: 'Uusi',
  999: 'Ei käytössä',
};

// Hakemuksen valintalaskennan tulokset, joissa historian jonosijan järjestyskriteerien tulokset
// vastaavat järjestyskriteerejä samoin kuin laskennan jälkeen (nimi ja prioriteetti)
export const HISTORIAN_VALINTALASKENNAN_TULOKSET = {
  ...HAKEMUKSEN_VALINTALASKENTA_TULOKSET,
  hakukohteet: HAKEMUKSEN_VALINTALASKENTA_TULOKSET.hakukohteet.map(
    (hakukohde) => ({
      ...hakukohde,
      valinnanvaihe: hakukohde.valinnanvaihe.map((vaihe) => ({
        ...vaihe,
        valintatapajonot: vaihe.valintatapajonot.map((jono) =>
          jono.valintatapajonooid === HISTORIA_VALINTATAPAJONOOID
            ? {
                ...jono,
                jonosijat: jono.jonosijat.map((jonosija) =>
                  jonosija.hakemusOid === HISTORIA_HAKEMUSOID
                    ? {
                        ...jonosija,
                        jarjestyskriteerit: [
                          {
                            arvo: 12,
                            tila: 'HYVAKSYTTAVISSA',
                            kuvaus: {},
                            prioriteetti: 0,
                            nimi: 'Yhteispisteet',
                          },
                          {
                            arvo: null,
                            tila: 'HYLATTY',
                            kuvaus: { FI: 'Pakollinen valintaperuste puuttuu' },
                            prioriteetti: 2,
                            nimi: 'Pakollisuus',
                          },
                        ],
                      }
                    : jonosija,
                ),
              }
            : jono,
        ),
      })),
    }),
  ),
};
