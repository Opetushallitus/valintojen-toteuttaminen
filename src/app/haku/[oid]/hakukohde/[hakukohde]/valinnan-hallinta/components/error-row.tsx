'use client';

import { TableCell, TableRow } from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ErrorAlert } from '@/components/error-alert';

type ErrorRowParams = {
  errorMessage: string | string[];
};

export const ErrorRow = ({ errorMessage }: ErrorRowParams) => {
  const { t } = useTranslations();
  return (
    <TableRow>
      <TableCell colSpan={4}>
        <ErrorAlert
          title={t('valinnanhallinta.virhe')}
          message={errorMessage}
          hasAccordion={true}
        />
      </TableCell>
    </TableRow>
  );
};
