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
//import useToaster from '@/app/hooks/useToaster';

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
}: {
  disabled: boolean;
}) => {
  const { t } = useTranslations();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const buttonId = `other-actions-hakukohde-menu`;
  //const { addToast } = useToaster();

  const showMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);

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
        <MenuItem onClick={closeMenu}>
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
        <MenuItem onClick={closeMenu}>
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
        <MenuItem onClick={closeMenu}>
          <StyledListItemIcon>
            <FileDownloadOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.osoitetarrat-lataa')}
          </StyledListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={closeMenu}>
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
