'use client';

import { Haku, Hakukohde, Tila } from './kouta-types';
import { client } from '../http-client';
import { Language, TranslatedName } from '../localization/localization-types';
import { UserPermissions } from '../permissions';
import { addProp, pick, pipe } from 'remeda';
import { HaunAsetukset } from '../ohjausparametrit/ohjausparametrit-types';
import { getConfiguration } from '@/lib/configuration/client-configuration';

type HakuResponseData = {
  oid: string;
  nimi: TranslatedName;
  tila: string;
  hakutapaKoodiUri: string;
  hakuvuosi: string;
  hakukausi: string;
  totalHakukohteet: number;
  kohdejoukkoKoodiUri: string;
  organisaatioOid: string;
};

const mapToHaku = (h: HakuResponseData) => {
  const haunTila: Tila = Tila[h.tila.toUpperCase() as keyof typeof Tila];

  return {
    oid: h.oid,
    nimi: h.nimi,
    tila: haunTila,
    hakutapaKoodiUri: h.hakutapaKoodiUri,
    alkamisVuosi: parseInt(h.hakuvuosi),
    alkamisKausiKoodiUri: h.hakukausi,
    hakukohteita: h?.totalHakukohteet ?? 0,
    kohdejoukkoKoodiUri: h.kohdejoukkoKoodiUri,
    organisaatioOid: h.organisaatioOid,
  };
};

const permissionsToTarjoajat = (userPermissions: UserPermissions): string =>
  userPermissions.hasOphCRUD
    ? ''
    : userPermissions.readOrganizations.reduce(
        (prev, current) => `${prev}&tarjoaja=${current}`,
        '',
      );

export async function getHaut(userPermissions: UserPermissions) {
  const configuration = await getConfiguration();
  const tarjoajaOids = permissionsToTarjoajat(userPermissions);
  const response = await client.get<Array<HakuResponseData>>(
    `${configuration.routes.koutaInternal.hautUrl({})}${tarjoajaOids}`,
  );
  const haut: Array<Haku> = response.data.map(mapToHaku);
  return haut;
}

export const isYhteishaku = (haku: Haku): boolean =>
  haku.hakutapaKoodiUri.startsWith('hakutapa_01');

export const usesLaskentaOrSijoittelu = ({
  haku,
  haunAsetukset,
}: {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
}) => isYhteishaku(haku) || haunAsetukset.sijoittelu;

export function isToisenAsteenYhteisHaku(haku: Haku): boolean {
  return (
    isYhteishaku(haku) &&
    haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_11')
  );
}

export const isAmmatillinenErityisopetus = (haku: Haku) =>
  haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_20');

export function isToinenAsteKohdejoukko(haku: Haku): boolean {
  return [
    'haunkohdejoukko_11', // perusopetuksen jälkeisen koulutuksen yhteishaku
    'haunkohdejoukko_17', // perusopetuksen jälkeinen valmistava koulutus
    'haunkohdejoukko_20', // erityisopetuksena järjestettävä ammatillinen koulutus
  ].some((hkj) => haku.kohdejoukkoKoodiUri.startsWith(hkj));
}

export function isKorkeakouluHaku(haku: Haku): boolean {
  return haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_12');
}

export function isHarkinnanvarainenHakukohde(hakukohde: Hakukohde): boolean {
  return hakukohde.voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita;
}

export function getOpetuskieliCode(hakukohde: Hakukohde): Language | null {
  if (hakukohde.opetuskielet.has('fi')) return 'fi';
  if (hakukohde.opetuskielet.has('sv')) return 'sv';
  if (hakukohde.opetuskielet.has('en')) return 'en';
  return null;
}

export async function getHaku(oid: string): Promise<Haku> {
  const configuration = getConfiguration();
  const response = await client.get<HakuResponseData>(
    `${configuration.routes.koutaInternal.hakuUrl({})}/${oid}`,
  );
  return mapToHaku(response.data);
}

type HakukohdeResponseData = {
  oid: string;
  hakuOid: string;
  nimi: TranslatedName;
  organisaatioOid: string;
  organisaatioNimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
  voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: boolean;
  opetuskieliKoodiUrit: Array<string>;
  tarjoaja: string;
};

const mapToHakukohde = (hakukohdeData: HakukohdeResponseData): Hakukohde => {
  const opetuskielet: Array<Language> = hakukohdeData.opetuskieliKoodiUrit
    .flatMap((koodiUri) => {
      // huom: tässä ei ole käsitelty kaikkia mahdollisia opetuskieliä
      switch (koodiUri.split('#')[0]) {
        case 'oppilaitoksenopetuskieli_1':
          return ['fi'];
        case 'oppilaitoksenopetuskieli_2':
          return ['sv'];
        case 'oppilaitoksenopetuskieli_3':
          return ['fi', 'sv'];
        case 'oppilaitoksenopetuskieli_4':
          return ['en'];
      }
    })
    .filter((v) => v !== undefined) as Array<Language>;
  return pipe(
    pick(hakukohdeData, [
      'oid',
      'hakuOid',
      'nimi',
      'organisaatioOid',
      'organisaatioNimi',
      'jarjestyspaikkaHierarkiaNimi',
      'voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita',
    ]),
    addProp('opetuskielet', new Set(opetuskielet)),
    addProp('tarjoajaOid', hakukohdeData.tarjoaja),
  );
};

export async function getHakukohteet(
  hakuOid: string,
  userPermissions: UserPermissions,
): Promise<Array<Hakukohde>> {
  const configuration = getConfiguration();
  const tarjoajaOids = permissionsToTarjoajat(userPermissions);
  const response = await client.get<Array<HakukohdeResponseData>>(
    `${configuration.routes.koutaInternal.hakukohteetUrl({})}&haku=${hakuOid}${tarjoajaOids}`,
  );
  return response.data.map(mapToHakukohde);
}

export const getHakukohteetQueryOptions = (
  hakuOid: string,
  userPermissions: UserPermissions,
) => ({
  queryKey: ['getHakukohteet', hakuOid, userPermissions],
  queryFn: () => getHakukohteet(hakuOid, userPermissions),
});

export async function getHakukohde(hakukohdeOid: string): Promise<Hakukohde> {
  const configuration = getConfiguration();
  const response = await client.get<HakukohdeResponseData>(
    `${configuration.routes.koutaInternal.hakukohdeUrl({})}/${hakukohdeOid}`,
  );

  return mapToHakukohde(response.data);
}
