'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useState } from 'react';
import { styled } from '@/lib/theme';
import { ArrowRight } from '@mui/icons-material';
import { OphButton } from '@opetushallitus/oph-design-system';

const StyledAccordionSummary = styled(AccordionSummary)({
  flexDirection: 'row-reverse',
  padding: 0,
  '.Mui-expanded .custom-expand-icon': {
    transform: 'rotate(-90deg)',
  },
});

const ErrorContent = ({
  message,
}: {
  message: string | Array<string> | undefined;
}) => {
  return message
    ? (Array.isArray(message) ? message : [message]).map((msg, index) => {
        return (
          <Typography variant="body2" key={`error-message-${index}`}>
            {msg}
          </Typography>
        );
      })
    : null;
};

export const ErrorAlert = ({
  title,
  message,
  messageChildren,
  hasAccordion = false,
  retry,
}: {
  title: string;
  message?: string | Array<string> | undefined;
  messageChildren?: React.ReactNode;
  hasAccordion?: boolean;
  retry?: () => void;
}) => {
  const [errorVisible, setErrorVisible] = useState(false);
  const { t } = useTranslations();

  return (
    <Alert
      severity="error"
      action={
        retry && (
          <OphButton sx={{ float: 'right' }} variant="text" onClick={retry}>
            {t('virhe.uudelleenyritys')}
          </OphButton>
        )
      }
    >
      <Typography color="error">{title}</Typography>
      <Box sx={{ marginTop: 1 }}>
        {hasAccordion ? (
          <Accordion sx={{ backgroundColor: 'transparent' }}>
            <StyledAccordionSummary
              expandIcon={<ArrowRight className="custom-expand-icon" />}
              sx={{ flexDirection: 'row-reverse', padding: 0 }}
              onClick={() => setErrorVisible(!errorVisible)}
            >
              <Typography>
                {errorVisible
                  ? t('valinnanhallinta.piilotavirhe')
                  : t('valinnanhallinta.naytavirhe')}
              </Typography>
            </StyledAccordionSummary>
            <AccordionDetails sx={{ paddingLeft: 0 }}>
              {messageChildren}
              {!messageChildren && <ErrorContent message={message} />}
            </AccordionDetails>
          </Accordion>
        ) : (
          <ErrorContent message={message} />
        )}
      </Box>
    </Alert>
  );
};
