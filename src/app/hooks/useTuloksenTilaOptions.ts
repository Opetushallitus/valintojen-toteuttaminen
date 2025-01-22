import { useMemo } from 'react';
import { TuloksenTila } from '../lib/types/laskenta-types';
import { useTranslations } from './useTranslations';

export const useTuloksenTilaOptions = ({
  harkinnanvarainen,
}: {
  harkinnanvarainen: boolean;
}) => {
  const { t } = useTranslations();

  return useMemo(
    () =>
      Object.values(TuloksenTila)
        .filter(
          (value) =>
            !(
              value === TuloksenTila.HYVAKSYTTY_HARKINNANVARAISESTI &&
              harkinnanvarainen
            ),
        )
        .map((value) => ({
          value,
          label: t('tuloksenTila.' + value),
        })),
    [harkinnanvarainen, t],
  );
};
