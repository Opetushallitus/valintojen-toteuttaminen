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
import {
  AcceptedLetterTemplateModal,
  NonAcceptedLetterTemplateModal,
} from './letter-template-modal';
import { showModal } from '@/app/components/global-modal';
import { ProgressModal } from './progress-modal-dialog';
import { luoOsoitetarratHakukohteessaHyvaksytyille } from '@/app/lib/valintalaskentakoostepalvelu';

const StyledListItemText = styled(ListItemText)(() => ({
  span: {
    color: ophColors.blue2,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  color: ophColors.blue2,
}));

const SendVastaanottopostiMenuItem = ({
  closeMenu,
  hakukohde,
}: {
  closeMenu: () => void;
  hakukohde: Hakukohde;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

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

  return (
    <MenuItem onClick={sendVastaanottoposti}>
      <StyledListItemIcon>
        <MailOutline />
      </StyledListItemIcon>
      <StyledListItemText>
        {t('sijoittelun-tulokset.toiminnot.laheta-vastaanottoposti-hakukohde')}
      </StyledListItemText>
    </MenuItem>
  );
};

const FormHyvaksymisKirjeMenuItem = ({
  closeMenu,
  hakukohde,
  sijoitteluajoId,
  setDocument,
}: {
  closeMenu: () => void;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  setDocument: (documentId: string) => void;
}) => {
  const { t } = useTranslations();

  const openAcceptedLetterTemplateModal = async () => {
    showModal(AcceptedLetterTemplateModal, {
      title: 'kirje-modaali.otsikko-hyvaksymiskirjeet',
      hakukohde: hakukohde,
      template: 'hyvaksymiskirje',
      sijoitteluajoId,
      setDocument,
    });
    closeMenu();
  };

  return (
    <MenuItem onClick={openAcceptedLetterTemplateModal}>
      <StyledListItemIcon>
        <InsertDriveFileOutlined />
      </StyledListItemIcon>
      <StyledListItemText>
        {t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde')}
      </StyledListItemText>
    </MenuItem>
  );
};

const FormEiHyvaksymisKirjeMenuItem = ({
  closeMenu,
  hakukohde,
  sijoitteluajoId,
}: {
  closeMenu: () => void;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
}) => {
  const { t } = useTranslations();

  const openNonAcceptedLetterTemplateModal = async () => {
    showModal(NonAcceptedLetterTemplateModal, {
      title: 'kirje-modaali.otsikko-ei-hyvaksymiskirjeet',
      hakukohde: hakukohde,
      template: 'jalkiohjauskirje',
      sijoitteluajoId,
    });
    closeMenu();
  };

  return (
    <MenuItem onClick={openNonAcceptedLetterTemplateModal}>
      <StyledListItemIcon>
        <InsertDriveFileOutlined />
      </StyledListItemIcon>
      <StyledListItemText>
        {t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde-ei')}
      </StyledListItemText>
    </MenuItem>
  );
};

const FormOsoiteTarratMenuItem = ({
  closeMenu,
  hakukohde,
  sijoitteluajoId,
  setDocument,
}: {
  closeMenu: () => void;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  setDocument: (documentId: string) => void;
}) => {
  const { t } = useTranslations();

  const openOsoitetarratModal = async () => {
    showModal(ProgressModal, {
      title: 'Osoitetarrojen muodostaminen',
      defaultFileName: 'osoitetarrat.pdf',
      progressMessage:
        'sijoittelun-tulokset.toiminnot.osoitetarrat-suoritetaan',
      setDocument,
      functionToMutate: () =>
        luoOsoitetarratHakukohteessaHyvaksytyille({
          sijoitteluajoId,
          hakukohde,
        }),
    });
    closeMenu();
  };

  return (
    <MenuItem onClick={openOsoitetarratModal}>
      <StyledListItemIcon>
        <InsertDriveFileOutlined />
      </StyledListItemIcon>
      <StyledListItemText>
        {t('sijoittelun-tulokset.toiminnot.osoitetarrat')}
      </StyledListItemText>
    </MenuItem>
  );
};

export const OtherActionsHakukohdeButton = ({
  disabled,
  hakukohde,
  hyvaksymiskirjeDocumentId,
  osoitetarraDocumentId,
  tulosDocumentId,
  sijoitteluajoId,
}: {
  disabled: boolean;
  hakukohde: Hakukohde;
  hyvaksymiskirjeDocumentId: string | null;
  osoitetarraDocumentId: string | null;
  tulosDocumentId: string | null;
  sijoitteluajoId: string;
}) => {
  const { t } = useTranslations();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hyvaksymiskirje, setHyvaksymiskirjeDocument] = useState<string | null>(
    hyvaksymiskirjeDocumentId,
  );
  const [osoitetarraDocument, setOsoitetarraDocument] = useState<string | null>(
    osoitetarraDocumentId,
  );

  const open = Boolean(anchorEl);
  const buttonId = `other-actions-hakukohde-menu`;

  const showMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);

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
        <SendVastaanottopostiMenuItem
          closeMenu={closeMenu}
          hakukohde={hakukohde}
        />
        <Divider />
        <FormHyvaksymisKirjeMenuItem
          closeMenu={closeMenu}
          hakukohde={hakukohde}
          sijoitteluajoId={sijoitteluajoId}
          setDocument={setHyvaksymiskirjeDocument}
        />
        <FormEiHyvaksymisKirjeMenuItem
          closeMenu={closeMenu}
          hakukohde={hakukohde}
          sijoitteluajoId={sijoitteluajoId}
        />
        <MenuItem
          onClick={() => openDocument(hyvaksymiskirje)}
          disabled={!hyvaksymiskirje}
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
        <FormOsoiteTarratMenuItem
          closeMenu={closeMenu}
          hakukohde={hakukohde}
          sijoitteluajoId={sijoitteluajoId}
          setDocument={setOsoitetarraDocument}
        />
        <MenuItem
          onClick={() => openDocument(osoitetarraDocument)}
          disabled={!osoitetarraDocument}
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
