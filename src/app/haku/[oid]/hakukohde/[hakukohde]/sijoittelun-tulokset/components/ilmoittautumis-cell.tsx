import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusEnriched,
} from '@/app/lib/types/sijoittelu-types';

export const IlmoittautumisCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusEnriched;
}) => {
  const { t } = useTranslations();

  const ilmoittautumistilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => {
      return { value: tila as string, label: t(`ilmoittautumistila.${tila}`) };
    },
  );

  return (
    <LocalizedSelect
      value={hakemus.ilmoittautumisTila}
      onChange={() => ''}
      options={ilmoittautumistilaOptions}
    />
  );
};
