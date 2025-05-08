import { DeleteOutline, History } from '@mui/icons-material';
import { showModal } from '@/components/modals/global-modal';

import { useTranslations } from '@/lib/localization/useTranslations';
import { ChangeHistoryGlobalModal } from '@/components/modals/change-history-global-modal';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { Dropdown } from '@/components/dropdown';
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
    <Dropdown.MenuButton type="icon-only" disabled={disabled}>
      <Dropdown.MenuItem
        label={t('sijoittelun-tulokset.toiminnot.muutoshistoria')}
        icon={<History />}
        onClick={() => {
          showModal(ChangeHistoryGlobalModal, {
            hakemus: {
              hakijanNimi: hakemus.hakijanNimi,
              hakemusOid: hakemus.hakemusOid,
              valintatapajonoOid,
            },
          });
        }}
        disabled={!hakemus.valintatapajonoOid} // Jos ei valintatapajonoa, ei tallennettuja tuloksia eikä muutoshistoriaa
      />
      <Dropdown.MenuItem
        label={t('valinnan-tulokset.toiminnot.poista-valinnan-tulokset')}
        icon={<DeleteOutline />}
        onClick={() => {
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
        }}
        disabled={!hakemus.valintatapajonoOid} // Hakemuksella ei ole tallennettuja tuloksia. Ei ole mitään mitä poistaa.
        />
    </Dropdown.MenuButton>
  );
};
