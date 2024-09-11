'use client';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { ExpandMore } from '@mui/icons-material';

export const AccordionBox = ({
  id,
  title,
  children,
  headingComponent = 'h3',
}: {
  id: string;
  title: React.ReactNode;
  headingComponent?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}) => {
  const headerId = `${id}-accordion-header`;
  const contentId = `${id}-accordion-content`;

  return (
    <Accordion
      defaultExpanded={true}
      sx={{
        border: DEFAULT_BOX_BORDER,
      }}
      slotProps={{ heading: { component: headingComponent } }}
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
