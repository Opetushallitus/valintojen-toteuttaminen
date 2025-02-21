import { ErrorWithIcon } from '@/app/components/error-with-icon';
import { ExternalLink } from '@/app/components/external-link';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { buildLinkToPerson } from '@/app/components/table/table-columns';
import { useTranslations } from '@/app/hooks/useTranslations';
import { buildLinkToApplication } from '@/app/lib/ataru';
import { OphApiError } from '@/app/lib/common';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { ValinnanTulosUpdateErrorResult } from '@/app/lib/types/valinta-tulos-types';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';

export const SijoittelunTulosErrorModalDialog = createModal(
  ({
    error,
    hakemukset,
  }: {
    error: Error;
    hakemukset: SijoittelunHakemusValintatiedoilla[];
  }) => {
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
        <SijoittelunTulosTallennusError error={error} hakemukset={hakemukset} />
      </OphModalDialog>
    );
  },
);

const SijoittelunTulosTallennusError = ({
  error,
  hakemukset,
}: {
  error: Error;
  hakemukset: SijoittelunHakemusValintatiedoilla[];
}) => {
  const { t } = useTranslations();

  const findMatchingHakemus = (hakemusOid: string) =>
    hakemukset.find((h) => h.hakemusOid === hakemusOid);

  if (error instanceof OphApiError && Array.isArray(error.response.data)) {
    const responseData = error.response
      .data as Array<ValinnanTulosUpdateErrorResult>;
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('hakeneet.taulukko.hakija')}</TableCell>
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
              const hakemus = findMatchingHakemus(hakemusOid);
              return (
                <TableRow key={hakemusOid}>
                  <TableCell>
                    {hakemus && (
                      <ExternalLink
                        noIcon={true}
                        name={hakemus.hakijanNimi}
                        href={buildLinkToPerson(hakemus.hakijaOid)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <ExternalLink
                      noIcon={true}
                      name={hakemusOid}
                      href={buildLinkToApplication(hakemusOid)}
                    />
                  </TableCell>
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
    return <ErrorWithIcon>{error.message ?? error}</ErrorWithIcon>;
  }
};
