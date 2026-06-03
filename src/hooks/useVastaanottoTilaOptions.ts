import { VastaanottoTila } from '../lib/types/sijoittelu-types';
import { useTranslations } from '../lib/localization/useTranslations';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  isKorkeakouluHaku,
  isToisenAsteenYhteisHaku,
} from '@/lib/kouta/kouta-service';

const KORKEAKOULU_VASTAANOTTOTILAT = [
  VastaanottoTila.KESKEN,
  VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
  VastaanottoTila.PERUNUT,
  VastaanottoTila.PERUUTETTU,
  VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN,
];

const MUUT_VASTAANOTTOTILAT = [
  VastaanottoTila.KESKEN,
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
  VastaanottoTila.PERUNUT,
  VastaanottoTila.PERUUTETTU,
];

const TOISEN_ASTEEN_YHTEISHAUN_VASTAANOTTOTILAT = [
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
  VastaanottoTila.PERUNUT,
];

export const getSelectableVastaanottoTilat = ({
  haku,
  isRekisterinpitaja = false,
}: {
  haku?: Haku;
  isRekisterinpitaja?: boolean;
}) => {
  if (!haku) {
    return Object.values(VastaanottoTila);
  }

  if (isToisenAsteenYhteisHaku(haku)) {
    return isRekisterinpitaja
      ? [
          ...TOISEN_ASTEEN_YHTEISHAUN_VASTAANOTTOTILAT,
          VastaanottoTila.PERUUTETTU,
        ]
      : TOISEN_ASTEEN_YHTEISHAUN_VASTAANOTTOTILAT;
  }

  return isKorkeakouluHaku(haku)
    ? KORKEAKOULU_VASTAANOTTOTILAT
    : MUUT_VASTAANOTTOTILAT;
};

export const getVastaanottoTilaLabelKey = ({
  tila,
  haku,
}: {
  tila: VastaanottoTila;
  haku?: Haku;
}) =>
  haku &&
  isToisenAsteenYhteisHaku(haku) &&
  tila === VastaanottoTila.VASTAANOTTANUT_SITOVASTI
    ? 'vastaanottotila.VASTAANOTTANUT'
    : `vastaanottotila.${tila}`;

type UseVastaanottoTilaOptionsConfig = {
  haku?: Haku;
  isRekisterinpitaja?: boolean;
  filterFn?: (tila: VastaanottoTila) => boolean;
};

export const useVastaanottoTilaOptions = (
  configOrFilterFn:
    | UseVastaanottoTilaOptionsConfig
    | ((tila: VastaanottoTila) => boolean) = {},
) => {
  const { t } = useTranslations();

  const config =
    typeof configOrFilterFn === 'function'
      ? { filterFn: configOrFilterFn }
      : configOrFilterFn;

  const { haku, isRekisterinpitaja, filterFn = () => true } = config;

  return getSelectableVastaanottoTilat({ haku, isRekisterinpitaja })
    .filter(filterFn)
    .map((tila) => ({
      value: tila as string,
      label: t(getVastaanottoTilaLabelKey({ tila, haku })),
    }));
};
