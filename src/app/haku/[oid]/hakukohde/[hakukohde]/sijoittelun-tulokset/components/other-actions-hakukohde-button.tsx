import { useTranslations } from '@/app/hooks/useTranslations';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import {
  FileDownloadOutlined,
  MailOutline,
  InsertDriveFileOutlined,
  ArrowDropDown,
} from '@mui/icons-material';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { sendVastaanottopostiHakukohteelle } from '@/app/lib/valinta-tulos-service';
import useToaster from '@/app/hooks/useToaster';
import { configuration } from '@/app/lib/configuration';

const StyledListItemText = styled(ListItemText)(() => ({
  span: {
    color: ophColors.blue2,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  color: ophColors.blue2,
}));

export const OtherActionsHakukohdeButton = ({
  disabled,
  hakukohde,
  hyvaksymiskirjeDocumentId,
  osoitetarraDocumentId,
  tulosDocumentId,
}: {
  disabled: boolean;
  hakukohde: Hakukohde;
  hyvaksymiskirjeDocumentId: string | null;
  osoitetarraDocumentId: string | null;
  tulosDocumentId: string | null;
}) => {
  const { t } = useTranslations();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const buttonId = `other-actions-hakukohde-menu`;
  const { addToast } = useToaster();

  const showMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);

  const sendVastaanottoposti = async () => {
    try {
      const data = await sendVastaanottopostiHakukohteelle(hakukohde.oid);
      if (!data || data.length < 1) {
        addToast({
          key: 'vastaanottoposti-hakemus-empty',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-hakukohteelle-ei-lahetettavia',
          type: 'error',
        });
      } else {
        addToast({
          key: 'vastaanottoposti-hakemus',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-hakukohteelle-lahetetty',
          type: 'success',
        });
      }
    } catch (e) {
      addToast({
        key: 'vastaanottoposti-hakemus-virhe',
        message:
          'sijoittelun-tulokset.toiminnot.vastaanottoposti-hakukohteelle-virhe',
        type: 'error',
      });
      console.error(e);
    }
    closeMenu();
  };

  const openDocument = async (documentId: string | null) => {
    if (documentId) {
      window.open(
        configuration.lataaDokumenttiUrl({ dokumenttiId: documentId }),
      );
    }
    closeMenu();
  };

  return (
    <>
      <OphButton
        id={buttonId}
        disabled={disabled}
        variant="outlined"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('sijoittelun-tulokset.toiminnot.menu-hakukohde')}
        onClick={showMenu}
        endIcon={<ArrowDropDown />}
      >
        {t('sijoittelun-tulokset.toiminnot.menu-hakukohde')}
      </OphButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        MenuListProps={{
          'aria-labelledby': buttonId,
        }}
      >
        <MenuItem onClick={sendVastaanottoposti}>
          <StyledListItemIcon>
            <MailOutline />
          </StyledListItemIcon>
          <StyledListItemText>
            {t(
              'sijoittelun-tulokset.toiminnot.laheta-vastaanottoposti-hakukohde',
            )}
          </StyledListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={closeMenu}>
          <StyledListItemIcon>
            <InsertDriveFileOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde')}
          </StyledListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <StyledListItemIcon>
            <InsertDriveFileOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde-ei')}
          </StyledListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => openDocument(hyvaksymiskirjeDocumentId)}
          disabled={!hyvaksymiskirjeDocumentId}
        >
          <StyledListItemIcon>
            <FileDownloadOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t(
              'sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde-lataa',
            )}
          </StyledListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={closeMenu}>
          <StyledListItemIcon>
            <InsertDriveFileOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.osoitetarrat')}
          </StyledListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => openDocument(osoitetarraDocumentId)}
          disabled={!osoitetarraDocumentId}
        >
          <StyledListItemIcon>
            <FileDownloadOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.osoitetarrat-lataa')}
          </StyledListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => openDocument(tulosDocumentId)}
          disabled={!tulosDocumentId}
        >
          <StyledListItemIcon>
            <FileDownloadOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.tulokset-lataa')}
          </StyledListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
