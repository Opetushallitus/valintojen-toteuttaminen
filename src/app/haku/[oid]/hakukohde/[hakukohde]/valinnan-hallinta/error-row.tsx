'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { aliasColors } from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';
import theme, { styled } from '@/app/theme';
import { ArrowRight, ErrorOutline } from '@mui/icons-material';
import { FetchError } from '@/app/lib/common';

type ErrorRowParams = {
  errorMessage: string | string[] | Error;
};

const StyledAccordionSummary = styled(AccordionSummary)({
  flexDirection: 'row-reverse',
  padding: 0,
  '.Mui-expanded .custom-expand-icon': {
    transform: 'rotate(-90deg)',
  },
});

const ErrorRow = ({ errorMessage }: ErrorRowParams) => {
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState<string | string[]>('');

  useEffect(() => {
    async function parseError() {
      if (errorMessage instanceof FetchError) {
        try {
          setError(await errorMessage.response.text());
        } catch (e) {
          console.warn(e);
        }
      } else if (errorMessage instanceof Error) {
        setError('' + errorMessage);
      } else {
        setError(errorMessage);
      }
    }
    parseError();
  }, [errorMessage]);

  const { t } = useTranslations();

  return (
    <TableRow sx={{ backgroundColor: `#FDF2F2` }}>
      <TableCell
        colSpan={4}
        sx={{
          color: aliasColors.error,
          fontWeight: 600,
          wordBreak: 'break-word',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            columnGap: theme.spacing(2),
          }}
        >
          <ErrorOutline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
            }}
          >
            <Typography sx={{ color: aliasColors.error }}>
              {t('valinnanhallinta.virhe')}
            </Typography>
            <Accordion sx={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}>
              <StyledAccordionSummary
                expandIcon={<ArrowRight className="custom-expand-icon" />}
                sx={{ flexDirection: 'row-reverse', padding: 0 }}
                onClick={() => setShowError(!showError)}
              >
                <Typography>
                  {showError
                    ? t('valinnanhallinta.piilotavirhe')
                    : t('valinnanhallinta.naytavirhe')}
                </Typography>
              </StyledAccordionSummary>
              <AccordionDetails sx={{ paddingLeft: 0 }}>
                {Array.isArray(error) && (
                  <>
                    {error.map((msg, index) => {
                      return (
                        <Typography key={`error-message-${index}`}>
                          {msg}
                        </Typography>
                      );
                    })}
                  </>
                )}
                {!Array.isArray(error) && <Typography>{error}</Typography>}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default ErrorRow;
