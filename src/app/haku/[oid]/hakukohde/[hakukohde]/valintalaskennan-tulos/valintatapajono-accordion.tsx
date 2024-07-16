'use client';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { ExpandMore } from '@mui/icons-material';
import React from 'react';

export const ValintatapajonoAccordion = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  const headerId = `${title}-accordion-header`;
  const contentId = `${title}-accordion-content`;

  return (
    <Accordion
      defaultExpanded={true}
      sx={{
        border: DEFAULT_BOX_BORDER,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls={contentId}
        id={headerId}
      >
        {title}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          borderTop: DEFAULT_BOX_BORDER,
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
