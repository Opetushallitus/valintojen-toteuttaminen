import { DeleteOutline, History } from '@mui/icons-material';
import { showModal } from '@/components/modals/global-modal';

import { useTranslations } from '@/lib/localization/useTranslations';
import { ChangeHistoryGlobalModal } from '@/components/modals/change-history-global-modal';
import { MenuSelectorButton } from '@/components/menu-selector-button';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { T } from '@tolgee/react';

export const OtherActionsCell = ({
  hakemus,
  valintatapajonoOid,
  disabled,
  removeValinnanTulos,
}: {
  hakemus: HakemuksenValinnanTulos;
  disabled: boolean;
  removeValinnanTulos: (hakemusOid: string) => void;
  valintatapajonoOid: string;
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
                valintatapajonoOid,
              },
            });
          },
          icon: <History />,
          label: t('sijoittelun-tulokset.toiminnot.muutoshistoria'),
        },
        {
          onClick: () => {
            showModal(ConfirmationGlobalModal, {
              title: t(
                'valinnan-tulokset.toiminnot.poista-valinnan-tulokset-vahvistus-otsikko',
              ),
              content: (
                <T
                  keyName="valinnan-tulokset.toiminnot.poista-valinnan-tulokset-vahvistus-teksti"
                  params={{
                    hakijanNimi: hakemus.hakijanNimi,
                    strong: <strong />,
                  }}
                />
              ),
              confirmLabel: t(
                'valinnan-tulokset.toiminnot.poista-valinnan-tulokset',
              ),
              cancelLabel: t('yleinen.peruuta'),
              onConfirm: () => {
                removeValinnanTulos(hakemus.hakemusOid);
              },
            });
          },
          icon: <DeleteOutline />,
          label: t('valinnan-tulokset.toiminnot.poista-valinnan-tulokset'),
          disabled: !hakemus.valintatapajonoOid, // Hakemuksella ei ole tallennettuja tuloksia. Ei ole mitään mitä poistaa.
        },
      ]}
    />
  );
};
