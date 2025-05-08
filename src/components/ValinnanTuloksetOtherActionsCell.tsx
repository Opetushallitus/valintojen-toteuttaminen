import {
  History,
  MailOutline,
  InsertDriveFileOutlined,
  DeleteOutline,
} from '@mui/icons-material';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { showModal } from '@/components/modals/global-modal';
import { ChangeHistoryGlobalModal } from '@/components/modals/change-history-global-modal';
import { AcceptedLetterTemplateModal } from '../app/haku/[oid]/hakukohde/[hakukohde]/sijoittelun-tulokset/components/letter-template-modal';
import { useUserPermissions } from '@/hooks/useUserPermissions';

import { useTranslations } from '@/lib/localization/useTranslations';
import {
  isKirjeidenMuodostaminenAllowed,
  isSendVastaanottoPostiVisible,
} from '@/lib/sijoittelun-tulokset-utils';
import { Dropdown } from '@/components/dropdown';
import { useSendVastaanottoPostiMutation } from '@/hooks/useSendVastaanottoPostiMutation';
import { SpinnerModal } from '@/components/modals/spinner-modal';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { T } from '@tolgee/react';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';

export const ValinnanTuloksetOtherActionsCell = ({
  hakemus,
  haku,
  hakukohde,
  disabled,
  sijoitteluajoId,
  kaikkiJonotHyvaksytty,
  removeValinnanTulos,
  valintatapajonoOid,
}: {
  hakemus: HakemuksenValinnanTulos;
  haku: Haku;
  hakukohde: Hakukohde;
  disabled: boolean;
  sijoitteluajoId?: string;
  kaikkiJonotHyvaksytty: boolean;
  valintatapajonoOid?: string;
  removeValinnanTulos?: (hakemusOid: string) => void;
}) => {
  const { t } = useTranslations();

  const createHyvaksymiskirjePDFs = async () => {
    showModal(AcceptedLetterTemplateModal, {
      title: 'kirje-modaali.otsikko-hyvaksymiskirje',
      hakukohde: hakukohde,
      template: 'hyvaksymiskirje',
      sijoitteluajoId,
      hakemusOids: [hakemus.hakemusOid],
    });
  };

  const { isPending: isSendingVastaanottoPosti, mutate: sendVastaanottoposti } =
    useSendVastaanottoPostiMutation({
      target: 'hakemus',
      hakemusOid: hakemus.hakemusOid,
    });

  const showChangeHistoryForHakemus = () => {
    showModal(ChangeHistoryGlobalModal, {
      hakemus: {
        ...hakemus,
        valintatapajonoOid: hakemus.valintatapajonoOid ?? valintatapajonoOid,
      },
    });
  };
  const userPermissions = useUserPermissions();

  // Jos hakemuksen valintatapajonoOid puuttuu, hakemukselle ei ole tallennettu valinnan tulosta
  const hakemuksentulosTallennettu = Boolean(hakemus.valintatapajonoOid);

  return (
    <Dropdown.MenuButton
      type="icon-only"
      label={t('sijoittelun-tulokset.toiminnot.menu')}
      disabled={disabled}
    >
      <SpinnerModal
        title={t('vastaanottoposti.lahetetaan')}
        open={isSendingVastaanottoPosti}
      />
      <Dropdown.MenuItem
        label={t('sijoittelun-tulokset.toiminnot.muutoshistoria')}
        icon={<History />}
        onClick={showChangeHistoryForHakemus}
      />
      {removeValinnanTulos && (
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
          disabled={!hakemuksentulosTallennettu}
        />
      )}

      <Dropdown.MenuItem
        label={t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje')}
        icon={<InsertDriveFileOutlined />}
        onClick={createHyvaksymiskirjePDFs}
        disabled={
          !hakemuksentulosTallennettu ||
          !isKirjeidenMuodostaminenAllowed(
            haku,
            userPermissions,
            kaikkiJonotHyvaksytty,
          )
        }
      />
      {isSendVastaanottoPostiVisible(haku, userPermissions) && (
        <Dropdown.MenuItem
          label={t('vastaanottoposti.laheta')}
          icon={<MailOutline />}
          onClick={() => sendVastaanottoposti()}
          disabled={!hakemuksentulosTallennettu}
        />
      )}
    </Dropdown.MenuButton>
  );
};
