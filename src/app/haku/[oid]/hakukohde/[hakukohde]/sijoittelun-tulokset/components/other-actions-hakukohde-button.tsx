import { useTranslations } from '@/lib/localization/useTranslations';
import {
  Divider,
} from '@mui/material';
import { useContext, useState } from 'react';
import {
  FileDownloadOutlined,
  MailOutline,
  InsertDriveFileOutlined,
  NoteOutlined,
} from '@mui/icons-material';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import {
  AcceptedLetterTemplateModal,
  NonAcceptedLetterTemplateModal,
} from './letter-template-modal';
import { showModal } from '@/components/modals/global-modal';
import { ProgressModal } from './progress-modal-dialog';
import { luoOsoitetarratHakukohteessaHyvaksytyille } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { Dropdown } from '@/components/dropdown';
import { useSendVastaanottoPostiMutation } from '@/hooks/useSendVastaanottoPostiMutation';
import { ConfigurationContext } from '@/components/providers/configuration-provider';

const SendVastaanottopostiMenuItem = ({
  hakukohde,
}: {
  hakukohde: Hakukohde;
}) => {
  const { t } = useTranslations();

  const { mutate: sendVastaanottoposti } = useSendVastaanottoPostiMutation({
    target: 'hakukohde',
    hakukohdeOid: hakukohde.oid,
  });

  return (
    <Dropdown.MenuItem
      onClick={() => sendVastaanottoposti()}
      icon={<MailOutline />}
      label={t('vastaanottoposti.hakukohde-laheta')}
    />
  );
};

const FormHyvaksymisKirjeMenuItem = ({
  hakukohde,
  sijoitteluajoId,
  setDocument,
}: {
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
  };

  return (
    <Dropdown.MenuItem
      onClick={openAcceptedLetterTemplateModal}
      icon={<InsertDriveFileOutlined />}
      label={t('sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde')}
    />
  );
};

const FormEiHyvaksymisKirjeMenuItem = ({
  hakukohde,
  korkeakouluHaku,
  sijoitteluajoId,
}: {
  hakukohde: Hakukohde;
  korkeakouluHaku: boolean;
  sijoitteluajoId: string;
}) => {
  const { t } = useTranslations();

  const templateTitle = korkeakouluHaku
    ? 'kirje-modaali.otsikko-ei-hyvaksymiskirjeet'
    : 'kirje-modaali.otsikko-jalkiohjauskirjeet';

  const itemText = korkeakouluHaku
    ? 'sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde-ei'
    : 'sijoittelun-tulokset.toiminnot.jalkiohjauskirje';

  const openNonAcceptedLetterTemplateModal = async () => {
    showModal(NonAcceptedLetterTemplateModal, {
      title: templateTitle,
      hakukohde: hakukohde,
      template: 'jalkiohjauskirje',
      sijoitteluajoId,
    });
  };

  return (
    <Dropdown.MenuItem
      onClick={openNonAcceptedLetterTemplateModal}
      icon={<InsertDriveFileOutlined />}
      label={t(itemText)}
    />
  );
};

const FormOsoiteTarratMenuItem = ({
  hakukohde,
  sijoitteluajoId,
  setDocument,
}: {
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  setDocument: (documentId: string) => void;
}) => {
  const { t } = useTranslations();

  const openOsoitetarratModal = async () => {
    showModal(ProgressModal, {
      title: 'sijoittelun-tulokset.toiminnot.osoitetarrat-suoritetaan-otsikko',
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
  };

  return (
    <Dropdown.MenuItem
      onClick={openOsoitetarratModal}
      label={t('sijoittelun-tulokset.toiminnot.osoitetarrat')}
      icon={<NoteOutlined />}
    />
  );
};

export const OtherActionsHakukohdeButton = ({
  disabled,
  haku,
  hakukohde,
  hyvaksymiskirjeDocumentId,
  osoitetarraDocumentId,
  tulosDocumentId,
  sijoitteluajoId,
}: {
  disabled: boolean;
  haku: Haku;
  hakukohde: Hakukohde;
  hyvaksymiskirjeDocumentId: string | null;
  osoitetarraDocumentId: string | null;
  tulosDocumentId: string | null;
  sijoitteluajoId: string;
}) => {

  const { configuration } = useContext(ConfigurationContext);
  const { t } = useTranslations();

  const [hyvaksymiskirje, setHyvaksymiskirjeDocument] = useState<string | null>(
    hyvaksymiskirjeDocumentId,
  );
  const [osoitetarraDocument, setOsoitetarraDocument] = useState<string | null>(
    osoitetarraDocumentId,
  );

  const openDocument = async (documentId: string | null) => {
    if (documentId) {
      window.open(
        configuration.lataaDokumenttiUrl({ dokumenttiId: documentId }),
      );
    }
  };

  return (
    <Dropdown.MenuButton
      label={t('sijoittelun-tulokset.toiminnot.menu-hakukohde')}
      disabled={disabled}
    >
      <SendVastaanottopostiMenuItem hakukohde={hakukohde} />
      <Divider />
      <FormHyvaksymisKirjeMenuItem
        hakukohde={hakukohde}
        sijoitteluajoId={sijoitteluajoId}
        setDocument={setHyvaksymiskirjeDocument}
      />
      <FormEiHyvaksymisKirjeMenuItem
        hakukohde={hakukohde}
        sijoitteluajoId={sijoitteluajoId}
        korkeakouluHaku={isKorkeakouluHaku(haku)}
      />
      <Dropdown.MenuItem
        onClick={() => openDocument(hyvaksymiskirje)}
        icon={<FileDownloadOutlined />}
        label={t(
          'sijoittelun-tulokset.toiminnot.hyvaksymiskirje-hakukohde-lataa',
        )}
        disabled={!hyvaksymiskirje}
      />
      <Divider />
      <FormOsoiteTarratMenuItem
        hakukohde={hakukohde}
        sijoitteluajoId={sijoitteluajoId}
        setDocument={setOsoitetarraDocument}
      />
      <Dropdown.MenuItem
        onClick={() => openDocument(osoitetarraDocument)}
        icon={<FileDownloadOutlined />}
        label={t('sijoittelun-tulokset.toiminnot.osoitetarrat-lataa')}
        disabled={!osoitetarraDocument}
      />
      <Divider />
      <Dropdown.MenuItem
        onClick={() => openDocument(tulosDocumentId)}
        icon={<FileDownloadOutlined />}
        label={t('sijoittelun-tulokset.toiminnot.tulokset-lataa')}
        disabled={!tulosDocumentId}
      />
    </Dropdown.MenuButton>
  );
};
