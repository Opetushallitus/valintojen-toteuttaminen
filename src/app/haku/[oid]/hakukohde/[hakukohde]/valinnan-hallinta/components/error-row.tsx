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
import { ophColors } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { styled } from '@/app/theme';
import { ArrowRight, ErrorOutline } from '@mui/icons-material';

type ErrorRowParams = {
  errorMessage: string | string[];
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

  const { t } = useTranslations();

  return (
    <TableRow sx={{ backgroundColor: `#FDF2F2` }}>
      <TableCell
        colSpan={4}
        sx={{
          color: ophColors.alias.error,
          fontWeight: 600,
          wordBreak: 'break-word',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            columnGap: 2,
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
            <Typography sx={{ color: ophColors.alias.error }}>
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
                {Array.isArray(errorMessage) && (
                  <>
                    {errorMessage.map((msg, index) => {
                      return (
                        <Typography key={`error-message-${index}`}>
                          {msg}
                        </Typography>
                      );
                    })}
                  </>
                )}
                {!Array.isArray(errorMessage) && (
                  <Typography>{errorMessage}</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default ErrorRow;
