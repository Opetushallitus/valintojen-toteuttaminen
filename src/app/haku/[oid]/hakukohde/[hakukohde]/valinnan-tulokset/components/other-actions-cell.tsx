import { History } from '@mui/icons-material';
import { showModal } from '@/components/modals/global-modal';

import { useTranslations } from '@/lib/localization/useTranslations';
import { ChangeHistoryGlobalModal } from '@/components/modals/change-history-global-modal';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { Dropdown } from '@/components/dropdown';

export const OtherActionsCell = ({
  hakemus,
  disabled,
}: {
  hakemus: HakemuksenValinnanTulos;
  disabled: boolean;
}) => {
  const { t } = useTranslations();

  return (
    <Dropdown.MenuButton type="icon-only" disabled={disabled}>
      <Dropdown.MenuItem
        label={t('sijoittelun-tulokset.toiminnot.muutoshistoria')}
        icon={<History />}
        onClick={() => {
          showModal(ChangeHistoryGlobalModal, {
            hakemus: {
              hakijanNimi: hakemus.hakijanNimi,
              hakemusOid: hakemus.hakemusOid,
              valintatapajonoOid: hakemus.valintatapajonoOid,
            },
          });
        }}
        disabled={!hakemus.valintatapajonoOid} // Jos ei valintatapajonoa, ei tallennettuja tuloksia eikä muutoshistoriaa
      />
    </Dropdown.MenuButton>
  );
};
