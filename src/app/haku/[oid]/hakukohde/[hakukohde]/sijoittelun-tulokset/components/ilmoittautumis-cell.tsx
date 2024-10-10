import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
} from '@/app/lib/types/sijoittelu-types';
import { hakemukselleNaytetaanIlmoittautumisTila } from '../lib/sijoittelun-tulokset-utils';
import { SijoittelunTuloksetChangeEvent } from '../lib/sijoittelun-tulokset-state';

export const IlmoittautumisCell = ({
  hakemus,
  disabled,
  updateForm,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTuloksetChangeEvent) => void;
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
          onChange={(event) =>
            updateForm({
              hakemusOid: hakemus.hakemusOid,
              ilmoittautumisTila: event.target.value as IlmoittautumisTila,
            })
          }
          options={ilmoittautumistilaOptions}
          disabled={disabled}
        />
      )}
    </>
  );
};
