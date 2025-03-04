import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import {
  History,
  MailOutline,
  InsertDriveFileOutlined,
  MoreHoriz,
} from '@mui/icons-material';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import useToaster from '@/hooks/useToaster';
import {
  changeHistoryForHakemus,
  sendVastaanottopostiHakemukselle,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { showModal } from '@/components/modals/global-modal';
import { ChangeHistoryModal } from './change-history-modal';
import { AcceptedLetterTemplateModal } from './letter-template-modal';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import {
  isKirjeidenMuodostaminenAllowed,
  isSendVastaanottoPostiVisible,
} from '../lib/sijoittelun-tulokset-permission-utils';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

const StyledListItemText = styled(ListItemText)(() => ({
  span: {
    color: ophColors.blue2,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  color: ophColors.blue2,
}));

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const buttonId = `other-actions-menu-${hakemus.hakemusOid}`;
  const { addToast } = useToaster();

  const showMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);

  const createHyvaksymiskirjePDFs = async () => {
    showModal(AcceptedLetterTemplateModal, {
      title: 'kirje-modaali.otsikko-hyvaksymiskirje',
      hakukohde: hakukohde,
      template: 'hyvaksymiskirje',
      sijoitteluajoId,
      hakemusOids: [hakemus.hakemusOid],
    });
    closeMenu();
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
    closeMenu();
  };

  const showChangeHistoryForHakemus = async () => {
    try {
      const history = await changeHistoryForHakemus(
        hakemus.hakemusOid,
        hakemus.valintatapajonoOid,
      );
      showModal(ChangeHistoryModal, { changeHistory: history, hakemus });
    } catch (e) {
      addToast({
        key: 'muutoshistoria-hakemukselle-virhe',
        message: 'sijoittelun-tulokset.toiminnot.muutoshistoria-virhe',
        type: 'error',
      });
      console.error(e);
    }
    closeMenu();
  };
  const { data: userPermissions } = useUserPermissions();

  return (
    <>
      <OphButton
        id={buttonId}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('sijoittelun-tulokset.toiminnot.menu')}
        onClick={showMenu}
        startIcon={<MoreHoriz />}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        MenuListProps={{
          'aria-labelledby': buttonId,
        }}
      >
        <MenuItem onClick={showChangeHistoryForHakemus}>
          <StyledListItemIcon>
            <History />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.muutoshistoria')}
          </StyledListItemText>
        </MenuItem>
        <MenuItem
          onClick={createHyvaksymiskirjePDFs}
          disabled={
            !isKirjeidenMuodostaminenAllowed(
              haku,
              userPermissions,
              kaikkiJonotHyvaksytty,
            )
          }
        >
          <StyledListItemIcon>
            <InsertDriveFileOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje')}
          </StyledListItemText>
        </MenuItem>
        {isSendVastaanottoPostiVisible(haku, userPermissions) && (
          <MenuItem onClick={sendVastaanottoposti}>
            <StyledListItemIcon>
              <MailOutline />
            </StyledListItemIcon>
            <StyledListItemText>
              {t('sijoittelun-tulokset.toiminnot.laheta-vastaanottoposti')}
            </StyledListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
