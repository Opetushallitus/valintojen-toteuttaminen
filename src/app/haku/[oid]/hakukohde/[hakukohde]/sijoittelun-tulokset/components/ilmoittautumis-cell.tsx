import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/app/lib/types/sijoittelu-types';
import { hakemukselleNaytetaanIlmoittautumisTila } from '../lib/sijoittelun-tulokset-utils';

export const IlmoittautumisCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
}) => {
  const { t } = useTranslations();

  const ilmoittautumistilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => {
      return { value: tila as string, label: t(`ilmoittautumistila.${tila}`) };
    },
  );

  const showSelect = hakemukselleNaytetaanIlmoittautumisTila(hakemus);

  return (
    <>
      {showSelect && (
        <LocalizedSelect
          value={hakemus.ilmoittautumisTila}
          onChange={() => ''}
          options={ilmoittautumistilaOptions}
        />
      )}
    </>
  );
};
