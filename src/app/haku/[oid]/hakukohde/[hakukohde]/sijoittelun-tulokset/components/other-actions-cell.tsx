import { useTranslations } from '@/app/hooks/useTranslations';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Typography,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useMemo, useState } from 'react';
import {
  History,
  MailOutline,
  InsertDriveFileOutlined,
} from '@mui/icons-material';
import { luoHyvaksymiskirjeetPDF } from '@/app/lib/valintalaskentakoostepalvelu';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import useToaster from '@/app/hooks/useToaster';
import {
  changeHistoryForHakemus,
  sendVastaanottopostiHakemukselle,
} from '@/app/lib/valinta-tulos-service';
import {
  createModal,
  showModal,
  useOphModalProps,
} from '@/app/components/global-modal';
import { HakemusChangeEvent } from '@/app/lib/types/valinta-tulos-types';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import {
  makeColumnWithCustomRender,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { getSortParts } from '@/app/components/table/table-utils';

const HistoryModalContent = ({
  changeHistory,
  sort,
  setSort,
}: {
  changeHistory: HakemusChangeEvent[];
  sort: string;
  setSort: (s: string) => void;
}) => {
  const { t } = useTranslations();

  const parseMuutos = (muutos: string | boolean) => {
    if (typeof muutos === 'boolean') {
      if (!muutos) {
        return t('yleinen.ei');
      }
      return t('yleinen.kylla');
    }
    return t(`sijoittelun-tulokset.muokkaushistoria.muutokset.${muutos}`, {
      defaultValue: muutos,
    });
  };

  const parseKey = (key: string) =>
    t(`sijoittelun-tulokset.muokkaushistoria.muutokset.${key}`, {
      defaultValue: key,
    });

  const columns = [
    makeGenericColumn<HakemusChangeEvent>({
      title: 'sijoittelun-tulokset.muokkaushistoria.ajankohta',
      key: 'changeTime',
      valueProp: 'changeTime',
    }),
    makeColumnWithCustomRender<HakemusChangeEvent>({
      title: 'sijoittelun-tulokset.muokkaushistoria.muutos',
      key: 'changes',
      renderFn: (props) =>
        props.changes.map((c, index) => (
          <Box key={`change-detail-${index}`}>
            {parseKey(c.field)}: {parseMuutos(c.to)}
          </Box>
        )),
      sortable: false,
    }),
  ];
  return (
    <ListTable
      rowKeyProp="rowKey"
      columns={columns}
      rows={changeHistory}
      sort={sort}
      setSort={setSort}
    />
  );
};

const ChangeHistoryModal = createModal(
  ({
    changeHistory,
    hakemus,
  }: {
    changeHistory: HakemusChangeEvent[];
    hakemus: SijoittelunHakemusValintatiedoilla;
  }) => {
    const modalProps = useOphModalProps();
    const { t } = useTranslations();

    const [sort, setSort] = useState<string>('changeTime:desc');

    const sortedHistory = useMemo(() => {
      const { direction } = getSortParts(sort);
      return changeHistory.sort((a, b) => {
        const aTime = new Date(a.changeTimeUnformatted).getTime();
        const bTime = new Date(b.changeTimeUnformatted).getTime();
        if (direction === 'asc') {
          return aTime - bTime;
        }
        return bTime - aTime;
      });
    }, [sort, changeHistory]);

    return (
      <OphModalDialog
        {...modalProps}
        title={t('sijoittelun-tulokset.muokkaushistoria.otsikko')}
        maxWidth="md"
        actions={
          <OphButton variant="outlined" onClick={modalProps.onClose}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
          {hakemus.hakijanNimi}
        </Typography>
        <HistoryModalContent
          changeHistory={sortedHistory}
          sort={sort}
          setSort={setSort}
        />
      </OphModalDialog>
    );
  },
);

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
        <MenuItem onClick={showChangeHistoryForHakemus}>
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
        <MenuItem onClick={sendVastaanottoposti}>
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
