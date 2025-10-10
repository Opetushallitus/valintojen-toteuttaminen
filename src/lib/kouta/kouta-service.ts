'use client';

import { Haku, Hakukohde, Tila } from './kouta-types';
import { client } from '@/lib/http-client';
import {
  Language,
  TranslatedName,
} from '@/lib/localization/localization-types';
import { UserPermissions } from '@/lib/permissions';
import { addProp, pick, pipe } from 'remeda';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from '@/lib/configuration/configuration-utils';
import { NDASH } from '@/lib/constants';

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
  metadata?: {
    koulutuksenAlkamiskausi?:
      | {
          alkamiskausityyppi: 'alkamiskausi ja -vuosi';
          koulutuksenAlkamiskausi: {
            koodiUri: 'kausi_k' | 'kausi_s';
          };
          koulutuksenAlkamisvuosi: string;
        }
      | {
          alkamiskausityyppi: 'tarkka alkamisajankohta';
          koulutuksenAlkamispaivamaara: string;
        }
      | {
          alkamiskausityyppi: 'henkilokohtainen suunnitelma';
        };
  };
};

const mapToHaku = (h: HakuResponseData) => {
  const haunTila: Tila = Tila[h.tila.toUpperCase() as keyof typeof Tila];

  return {
    oid: h.oid,
    nimi: h.nimi,
    tila: haunTila,
    hakutapaKoodiUri: h.hakutapaKoodiUri,
    koulutuksenAlkamiskausi: h?.metadata?.koulutuksenAlkamiskausi,
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
  const configuration = getConfiguration();
  const tarjoajaOids = permissionsToTarjoajat(userPermissions);
  const response = await client.get<Array<HakuResponseData>>(
    `${configuration.routes.koutaInternal.hautUrl}${tarjoajaOids}`,
  );
  return response.data.map(mapToHaku);
}

export const isYhteishaku = (haku: Haku): boolean =>
  haku.hakutapaKoodiUri.startsWith('hakutapa_01');

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
    getConfigUrl(configuration.routes.koutaInternal.hakuUrl, { hakuOid: oid }),
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
  koulutustyyppikoodi: string;
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
      'koulutustyyppikoodi',
    ]),
    addProp('opetuskielet', new Set(opetuskielet)),
    addProp('tarjoajaOid', hakukohdeData.tarjoaja),
  );
};

export async function getHakukohteet(
  hakuOid: string,
  userPermissions: UserPermissions,
): Promise<Array<Hakukohde>> {
  const hakukohteetUrl = getConfigUrl(
    getConfiguration().routes.koutaInternal.hakukohteetUrl,
    { hakuOid },
  );
  const tarjoajaOids = permissionsToTarjoajat(userPermissions);
  const response = await client.get<Array<HakukohdeResponseData>>(
    `${hakukohteetUrl}${tarjoajaOids}`,
  );
  return response.data.map(mapToHakukohde);
}

export async function getAllHakukohteet(
  hakuOid: string,
): Promise<Array<Hakukohde>> {
  const hakukohteetUrl = getConfigUrl(
    getConfiguration().routes.koutaInternal.hakukohteetUrl,
    { hakuOid },
  );
  const response =
    await client.get<Array<HakukohdeResponseData>>(hakukohteetUrl);
  return response.data.map(mapToHakukohde);
}

export async function getHakukohde(hakukohdeOid: string): Promise<Hakukohde> {
  const hakukohdeUrl = getConfigUrl(
    getConfiguration().routes.koutaInternal.hakukohdeUrl,
    { hakukohdeOid },
  );
  const response = await client.get<HakukohdeResponseData>(hakukohdeUrl);
  return mapToHakukohde(response.data);
}

export function getHakukohdeFullName(
  hakukohde: Hakukohde,
  translateEntity: (translateable?: TranslatedName) => string,
  organizationFirst: boolean = false,
): string {
  const jarjestysPaikka = hakukohde.jarjestyspaikkaHierarkiaNimi
    ? `${translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}`
    : '';
  return organizationFirst
    ? `${jarjestysPaikka}, ${translateEntity(hakukohde.nimi)}`
    : `${translateEntity(hakukohde.nimi)} ${NDASH} ${jarjestysPaikka}`;
}
