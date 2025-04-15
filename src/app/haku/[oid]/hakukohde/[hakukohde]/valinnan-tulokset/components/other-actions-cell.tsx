import { History } from '@mui/icons-material';
import { showModal } from '@/components/modals/global-modal';

import { useTranslations } from '@/lib/localization/useTranslations';
import { ChangeHistoryGlobalModal } from '@/components/modals/change-history-global-modal';
import { MenuSelectorButton } from '@/components/menu-selector-button';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';

export const OtherActionsCell = ({
  hakemus,
  disabled,
}: {
  hakemus: HakemuksenValinnanTulos;
  disabled: boolean;
}) => {
  const { t } = useTranslations();

  return (
    <MenuSelectorButton
      type="icon-only"
      disabled={disabled}
      options={[
        {
          onClick: () => {
            showModal(ChangeHistoryGlobalModal, {
              hakemus: {
                hakijanNimi: hakemus.hakijanNimi,
                hakemusOid: hakemus.hakemusOid,
                valintatapajonoOid: hakemus.valintatapajonoOid,
              },
            });
          },
          icon: <History />,
          label: t('sijoittelun-tulokset.toiminnot.muutoshistoria'),
          disabled: !hakemus.valintatapajonoOid, // Jos ei valintatapajonoa, ei tallennettuja tuloksia eikä muutoshistoriaa
        },
      ]}
    />
  );
};
