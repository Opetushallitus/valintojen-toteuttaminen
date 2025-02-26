import { useTranslations } from '@/app/hooks/useTranslations';
import { TRANSITION_DURATION } from '@/app/lib/constants';
import { styled } from '@/app/lib/theme';
import { ExpandMore } from '@mui/icons-material';
import { Box } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import React, { useId, useState } from 'react';

const HeaderBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  height: '100%',
  width: '100%',
  '.MuiButtonBase-root': {
    borderLeft: `1px solid ${ophColors.grey200}`,
    height: '100%',
    '&.emphasize': {
      backgroundColor: ophColors.grey50,
    },
  },
}));

const ContextBox = styled(Box)(({ theme }) => ({
  display: 'grid',
  width: '100%',
  backgroundColor: 'white',
  paddingLeft: theme.spacing(1.5),
  gridTemplateRows: '1fr',
  transition: `${TRANSITION_DURATION} grid-template-rows ease`,
  '&.accordion-content--closed': {
    gridTemplateRows: '0fr',
  },
}));

export const ValintaryhmaAccordion = ({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className: string;
}) => {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(true);

  const accordionId = useId();
  const contentId = `ValintaryhmaAccordionContent_${accordionId}`;

  return (
    <Box
      sx={{
        display: 'flex',
        paddingRight: 0,
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      className={className}
    >
      <HeaderBox>
        {title}
        <OphButton
          variant="text"
          sx={{ fontWeight: 'normal', paddingX: 0 }}
          startIcon={
            <ExpandMore
              sx={{
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: `${TRANSITION_DURATION} transform ease`,
                color: ophColors.black,
              }}
            />
          }
          onClick={() => setIsOpen((open) => !open)}
          aria-label={t(
            isOpen
              ? 'valintaryhmittain.piilota-alaryhmat'
              : 'valintaryhmittain.nayta-alaryhmat',
          )}
          aria-controls={contentId}
          aria-expanded={isOpen ? 'true' : 'false'}
        />
      </HeaderBox>
      <ContextBox
        id={contentId}
        className={
          isOpen ? 'accordion-content--open' : 'accordion-content--closed'
        }
      >
        <Box sx={{ overflow: 'hidden' }}>{isOpen && children}</Box>
      </ContextBox>
    </Box>
  );
};
