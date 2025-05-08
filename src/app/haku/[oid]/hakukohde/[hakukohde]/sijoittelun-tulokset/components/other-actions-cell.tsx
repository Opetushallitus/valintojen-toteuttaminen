import {
  History,
  MailOutline,
  InsertDriveFileOutlined,
} from '@mui/icons-material';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { showModal } from '@/components/modals/global-modal';
import { ChangeHistoryGlobalModal } from '@/components/modals/change-history-global-modal';
import { AcceptedLetterTemplateModal } from './letter-template-modal';
import { useUserPermissions } from '@/hooks/useUserPermissions';

import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import {
  isKirjeidenMuodostaminenAllowed,
  isSendVastaanottoPostiVisible,
} from '@/lib/sijoittelun-tulokset-utils';
import { Dropdown } from '@/components/dropdown';
import { useSendVastaanottoPostiMutation } from '@/hooks/useSendVastaanottoPostiMutation';
import { SpinnerModal } from '@/components/modals/spinner-modal';

export const OtherActionsCell = ({
  hakemus,
  haku,
  hakukohde,
  disabled,
  sijoitteluajoId,
  kaikkiJonotHyvaksytty,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  haku: Haku;
  hakukohde: Hakukohde;
  disabled: boolean;
  sijoitteluajoId: string;
  kaikkiJonotHyvaksytty: boolean;
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

  const showChangeHistoryForHakemus = async () => {
    showModal(ChangeHistoryGlobalModal, { hakemus });
  };
  const { data: userPermissions } = useUserPermissions();

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
      <Dropdown.MenuItem
        label={t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje')}
        icon={<InsertDriveFileOutlined />}
        onClick={createHyvaksymiskirjePDFs}
        disabled={
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
        />
      )}
    </Dropdown.MenuButton>
  );
};
