import { useTranslations } from '@/app/hooks/useTranslations';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import {
  History,
  MailOutline,
  InsertDriveFileOutlined,
} from '@mui/icons-material';
import { luoHyvaksymiskirjeetPDF } from '@/app/lib/valintalaskentakoostepalvelu';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import useToaster from '@/app/hooks/useToaster';

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
  hakukohde,
  disabled,
  sijoitteluajoId,
}: {
  hakemus: SijoittelunHakemusValintatiedoilla;
  hakukohde: Hakukohde;
  disabled: boolean;
  sijoitteluajoId: string;
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
    try {
      await luoHyvaksymiskirjeetPDF(
        [hakemus.hakemusOid],
        sijoitteluajoId,
        hakukohde,
      );
      addToast({
        key: 'hyvaksymiskirje-hakemus',
        message:
          'sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakemukselle-luotu',
        type: 'success',
      });
    } catch (e) {
      addToast({
        key: 'hyvaksymiskirje-hakemus-virhe',
        message:
          'sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakemukselle-luotu-epaonnistui',
        type: 'error',
      });
      console.error(e);
    }
    closeMenu();
  };

  return (
    <>
      <OphButton
        id={buttonId}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={showMenu}
      >
        ...
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
            <History />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.muutoshistoria')}
          </StyledListItemText>
        </MenuItem>
        <MenuItem onClick={createHyvaksymiskirjePDFs}>
          <StyledListItemIcon>
            <InsertDriveFileOutlined />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje')}
          </StyledListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <StyledListItemIcon>
            <MailOutline />
          </StyledListItemIcon>
          <StyledListItemText>
            {t('sijoittelun-tulokset.toiminnot.laheta-vastaanottoposti')}
          </StyledListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
