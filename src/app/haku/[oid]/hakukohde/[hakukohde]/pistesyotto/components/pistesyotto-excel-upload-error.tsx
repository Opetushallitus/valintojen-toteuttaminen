import { ErrorWithIcon } from '@/app/components/error-with-icon';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphApiError } from '@/app/lib/common';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

export const PistesyottoTuontiError = ({ error }: { error: Error }) => {
  const { t } = useTranslations();
  if (error instanceof OphApiError && Array.isArray(error.response.data)) {
    const responseData = error.response.data as Array<{
      applicationOID: string;
      errorMessage: string;
    }>;
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
            {responseData.map(({ applicationOID, errorMessage }) => {
              return (
                <TableRow key={applicationOID}>
                  <TableCell>{applicationOID}</TableCell>
                  <TableCell>
                    <ErrorWithIcon>{errorMessage}</ErrorWithIcon>
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
        <ErrorWithIcon>{error.message}</ErrorWithIcon>
      </OphTypography>
    );
  }
};
