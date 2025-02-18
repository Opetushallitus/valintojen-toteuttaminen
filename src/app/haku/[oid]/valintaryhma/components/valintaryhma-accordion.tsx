import { TRANSITION_DURATION } from '@/app/lib/constants';
import { ArrowRight } from '@mui/icons-material';
import { Box } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useId, useState } from 'react';

export const ValintaryhmaAccordion = ({
  titleOpen,
  titleClosed,
  children,
}: {
  titleOpen: React.ReactNode;
  titleClosed: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const accordionId = useId();
  const contentId = `ValintaryhmaAccordionContent_${accordionId}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        '&.MuiButton-icon': {
          marginRight: 0.5,
        },
      }}
    >
      <OphButton
        variant="text"
        sx={{ fontWeight: 'normal', paddingX: 0 }}
        startIcon={
          <ArrowRight
            sx={{
              transform: isOpen ? 'rotate(90deg)' : 'none',
              transition: `${TRANSITION_DURATION} transform ease`,
              color: ophColors.black,
            }}
          />
        }
        onClick={() => setIsOpen((open) => !open)}
        aria-controls={contentId}
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        {isOpen ? titleOpen : titleClosed}
      </OphButton>
      <Box
        id={contentId}
        sx={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: `${TRANSITION_DURATION} grid-template-rows ease`,
        }}
      >
        <Box sx={{ overflow: 'hidden' }}>{children}</Box>
      </Box>
    </Box>
  );
};