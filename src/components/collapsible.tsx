import { Box } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useId } from 'react';
import { TRANSITION_DURATION } from '../lib/constants';

export const Collapsible = ({
  titleOpen,
  titleClosed,
  children,
  isOpen,
  setIsOpen,
  ButtonComponent = OphButton,
}: {
  titleOpen: React.ReactNode;
  titleClosed: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ButtonComponent: React.ComponentType<React.ComponentProps<typeof OphButton>>;
}) => {
  const collapsibleId = useId();
  const contentId = `Collapsible_${collapsibleId}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <ButtonComponent
        onClick={() => setIsOpen((open) => !open)}
        aria-controls={contentId}
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        {isOpen ? titleOpen : titleClosed}
      </ButtonComponent>
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
