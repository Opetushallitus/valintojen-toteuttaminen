import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphApiError } from '@/app/lib/common';
import { ValintaStatusUpdateErrorResult } from '@/app/lib/types/valinta-tulos-types';
import { Error } from '@mui/icons-material';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';

export const ErrorModalDialog = createModal(({ error }: { error: Error }) => {
  const modalProps = useOphModalProps();
  const { t, i18n } = useTranslations();
  return (
    <OphModalDialog
      {...modalProps}
      title={
        error?.message && i18n.exists(error.message)
          ? t(error.message)
          : t('virhe.tallennus')
      }
      maxWidth="md"
      actions={
        <OphButton variant="outlined" onClick={modalProps.onClose}>
          {t('yleinen.sulje')}
        </OphButton>
      }
    >
      <SijoittelunTulosTallennusError error={error} />
    </OphModalDialog>
  );
});

const ErrorWithIcon = ({ children }: { children: string }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Error color="error" />
      <Box component="span" sx={{ paddingLeft: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export const SijoittelunTulosTallennusError = ({ error }: { error: Error }) => {
  const { t } = useTranslations();
  if (error instanceof OphApiError && Array.isArray(error.response.data)) {
    const responseData = error.response
      .data as Array<ValintaStatusUpdateErrorResult>;
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {t('pistesyotto.tuonti-tulos-taulukko.hakemus-oid')}
              </TableCell>
              <TableCell>
                {t('pistesyotto.tuonti-tulos-taulukko.virhe')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responseData.map(({ hakemusOid, message }) => {
              return (
                <TableRow key={hakemusOid}>
                  <TableCell>{hakemusOid}</TableCell>
                  <TableCell>
                    <ErrorWithIcon>{message}</ErrorWithIcon>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  } else {
    return (
      <OphTypography>
        <ErrorWithIcon>{error.message ?? error}</ErrorWithIcon>
      </OphTypography>
    );
  }
};
