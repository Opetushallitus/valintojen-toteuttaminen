import {
  History,
  MailOutline,
  InsertDriveFileOutlined,
} from '@mui/icons-material';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import useToaster from '@/hooks/useToaster';
import { sendVastaanottopostiHakemukselle } from '@/lib/valinta-tulos-service/valinta-tulos-service';
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
  const { addToast } = useToaster();

  const createHyvaksymiskirjePDFs = async () => {
    showModal(AcceptedLetterTemplateModal, {
      title: 'kirje-modaali.otsikko-hyvaksymiskirje',
      hakukohde: hakukohde,
      template: 'hyvaksymiskirje',
      sijoitteluajoId,
      hakemusOids: [hakemus.hakemusOid],
    });
  };

  const sendVastaanottoposti = async () => {
    try {
      const data = await sendVastaanottopostiHakemukselle(hakemus.hakemusOid);
      if (!data || data.length < 1) {
        addToast({
          key: 'vastaanottoposti-hakemus-empty',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-hakemukselle-ei-lahetettavia',
          type: 'error',
        });
      } else {
        addToast({
          key: 'vastaanottoposti-hakemus',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-hakemukselle-lahetetty',
          type: 'success',
        });
      }
    } catch (e) {
      addToast({
        key: 'vastaanottoposti-hakemus-virhe',
        message:
          'sijoittelun-tulokset.toiminnot.vastaanottoposti-hakemukselle-virhe',
        type: 'error',
      });
      console.error(e);
    }
  };

  const showChangeHistoryForHakemus = async () => {
    try {
      showModal(ChangeHistoryGlobalModal, { hakemus });
    } catch (e) {
      addToast({
        key: 'muutoshistoria-hakemukselle-virhe',
        message: 'sijoittelun-tulokset.toiminnot.muutoshistoria-virhe',
        type: 'error',
      });
      console.error(e);
    }
  };
  const { data: userPermissions } = useUserPermissions();

  return (
    <Dropdown.MenuButton
      type="icon-only"
      label={t('sijoittelun-tulokset.toiminnot.menu')}
      disabled={disabled}
    >
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
          label={t('sijoittelun-tulokset.toiminnot.laheta-vastaanottoposti')}
          icon={<MailOutline />}
          onClick={sendVastaanottoposti}
        />
      )}
    </Dropdown.MenuButton>
  );
};
