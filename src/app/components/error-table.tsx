import { ErrorWithIcon } from '@/app/components/error-with-icon';
import { useTranslations } from '@/app/lib/localization/useTranslations';
import { isEmpty, OphApiError, OphProcessError } from '@/app/lib/common';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

function mapErrorToTableData(
  error: Error,
): Array<{ id: string; message: string }> {
  if (error instanceof OphApiError && Array.isArray(error.response.data)) {
    return (
      error.response.data as Array<{
        applicationOID: string;
        errorMessage: string;
      }>
    ).map((d) => ({ id: d.applicationOID, message: d.errorMessage }));
  }
  if (error instanceof OphProcessError) {
    return error.processObject.filter((d) => !d.isService);
  }
  return [];
}

export const ErrorTable = ({
  error,
  oidHeader,
}: {
  error: Error;
  oidHeader?: string;
}) => {
  const { t } = useTranslations();

  const errorData = mapErrorToTableData(error);

  if (!isEmpty(errorData)) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{oidHeader ? t(oidHeader) : 'OID'}</TableCell>
              <TableCell>{t('yleinen.virhe')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorData.map(({ id, message }) => {
              return (
                <TableRow key={id}>
                  <TableCell>{id}</TableCell>
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
        <ErrorWithIcon>{error.message}</ErrorWithIcon>
      </OphTypography>
    );
  }
};
