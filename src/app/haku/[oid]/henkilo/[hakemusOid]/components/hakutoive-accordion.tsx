import { HakijaInfo } from '@/app/lib/types/ataru-types';
import { HakukohdeTuloksilla } from '../hooks/useHenkiloPageData';
import { useTranslations } from '@/app/hooks/useTranslations';
import { isEmpty } from 'remeda';
import { useState } from 'react';
import { Box, TableBody, TableCell, TableRow } from '@mui/material';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { styled } from '@/app/lib/theme';
import { ChevronRight } from '@mui/icons-material';
import { HakutoiveTitle } from './hakutoive-title';
import { HakutoiveAccordionContent } from './hakutoive-accordion-content';

const AccordionHeader = styled(Box)(({ theme }) => ({
  ...theme.typography.h5,
  display: 'flex',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

export const HakutoiveAccordion = ({
  hakukohde,
  hakutoiveNumero,
  hakija,
}: {
  hakukohde: HakukohdeTuloksilla;
  hakutoiveNumero: number;
  hakija: HakijaInfo;
}) => {
  const { t } = useTranslations();

  const { valinnanvaiheet } = hakukohde;

  const noContent = isEmpty(valinnanvaiheet ?? []);

  const [isOpen, setIsOpen] = useState(() => !noContent);

  const headerId = `hakutoive-header-${hakutoiveNumero}`;
  const contentId = `hakutoive-content-${hakutoiveNumero}`;

  return (
    <>
      <TableBody>
        <TableRow
          sx={{
            width: '100%',
            borderTop: DEFAULT_BOX_BORDER,
            backgroundColor: noContent ? ophColors.grey50 : ophColors.white,
          }}
        >
          <TableCell colSpan={7} component="th">
            <AccordionHeader>
              <OphButton
                variant="text"
                title={
                  isOpen
                    ? t('henkilo.taulukko.piilota-hakutoiveen-tiedot')
                    : t('henkilo.taulukko.nayta-hakutoiveen-tiedot')
                }
                aria-label={
                  isOpen
                    ? t('henkilo.taulukko.piilota-hakutoiveen-tiedot')
                    : t('henkilo.taulukko.nayta-hakutoiveen-tiedot')
                }
                sx={{ color: ophColors.black }}
                startIcon={
                  <ChevronRight
                    sx={{
                      transform: isOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.15s ease-in-out',
                    }}
                  />
                }
                onClick={() => setIsOpen((open) => !open)}
                aria-controls={contentId}
                aria-expanded={isOpen ? 'true' : 'false'}
              />
              <Box id={headerId} sx={{ color: 'black' }}>
                <HakutoiveTitle
                  hakutoiveNumero={hakutoiveNumero}
                  hakukohde={hakukohde}
                />
              </Box>
            </AccordionHeader>
          </TableCell>
        </TableRow>
      </TableBody>
      <TableBody
        role="region"
        id={contentId}
        aria-labelledby={headerId}
        sx={{
          display: isOpen ? 'table-row-group' : 'none',
        }}
      >
        <HakutoiveAccordionContent
          hakija={hakija}
          hakukohde={hakukohde}
          hakutoiveNumero={hakutoiveNumero}
        />
      </TableBody>
    </>
  );
};