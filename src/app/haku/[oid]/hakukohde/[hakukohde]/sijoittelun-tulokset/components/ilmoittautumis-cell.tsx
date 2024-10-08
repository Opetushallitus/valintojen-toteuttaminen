import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';

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

  const showSelect =
    hakemus.naytetaanVastaanottoTieto &&
    [
      VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    ].includes(hakemus.vastaanottotila);

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
