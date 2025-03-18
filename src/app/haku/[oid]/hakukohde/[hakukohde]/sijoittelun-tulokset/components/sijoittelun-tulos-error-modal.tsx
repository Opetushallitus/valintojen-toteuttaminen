import { ErrorWithIcon } from '@/components/error-with-icon';
import { ExternalLink } from '@/components/external-link';
import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { OphModal } from '@/components/modals/oph-modal';
import { buildLinkToPerson } from '@/components/table/table-columns';
import { useTranslations } from '@/lib/localization/useTranslations';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { OphApiError } from '@/lib/common';
import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { ValinnanTulosUpdateErrorResult } from '@/lib/valinta-tulos-service/valinta-tulos-types';
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
    hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  }) => {
    const modalProps = useOphModalProps();
    const { t } = useTranslations();
    return (
      <OphModal
        {...modalProps}
        title={
          error?.message
            ? t({
                key: error?.message,
                defaultValue: t('virhe.tallennus'),
              })
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
      </OphModal>
    );
  },
);

const SijoittelunTulosTallennusError = ({
  error,
  hakemukset,
}: {
  error: Error;
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
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
