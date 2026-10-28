import React, { useEffect, useState } from 'react';

import { Backdrop, Box, Button, Tooltip } from '@mui/material';

import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { Close as CloseIcon, InfoOutlined } from '@mui/icons-material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { TooltipStyleWrapper as StyleWrapper } from '@/components/tooltip-style-wrapper';

type Props = {
  title: React.JSX.Element | string;
  // Tooltipin enimmäisleveys, oletuksena (300px)
  maxWidth?: string;
  // Painikkeen saavutettava nimi, oletuksena "Lisätietoja"
  ariaLabel?: string;
};

// MUI:n oletusleveys tooltipille
const DEFAULT_MAX_WIDTH = '300px';
// Nuolellisen oikealle avautuvan tooltipin etäisyys ikonista (MUI) ja väli ikkunan oikeaan reunaan
const TOOLTIP_OFFSET_PX = 14;
const VIEWPORT_MARGIN_PX = 16;
// Jos ikonin oikealle puolelle jää tätä vähemmän tilaa, tooltip avataan vasemmalle
const MIN_RIGHT_SPACE_PX = 200;

type Placement = 'right' | 'left';

// Ikonin ja ikkunan reunan väliin mahtuva tooltipin leveys valitulla puolella
const getAvailableWidth = (anchor: HTMLElement, placement: Placement) => {
  const rect = anchor.getBoundingClientRect();
  const space =
    placement === 'right'
      ? document.documentElement.clientWidth - rect.right
      : rect.left;
  return space - TOOLTIP_OFFSET_PX - VIEWPORT_MARGIN_PX;
};

// Valitaan tooltipin puoli: oikealle, ellei sinne jää liian vähän tilaa, jolloin vasemmalle.
// Palautetaan myös valitulle puolelle mahtuva leveys.
const choosePlacement = (anchor: HTMLElement) => {
  const rightSpace = getAvailableWidth(anchor, 'right');
  const placement: Placement =
    rightSpace < MIN_RIGHT_SPACE_PX ? 'left' : 'right';
  return {
    placement,
    availableWidth:
      placement === 'right' ? rightSpace : getAvailableWidth(anchor, 'left'),
  };
};

export const InfoTooltipButton = ({ title, maxWidth, ariaLabel }: Props) => {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [valinta, setValinta] = useState<ReturnType<typeof choosePlacement>>();
  const placement = valinta?.placement ?? 'right';
  const availableWidth = valinta?.availableWidth;

  // Valitaan puoli ja leveys uudelleen ikkunan koon muuttuessa, kun tooltip on auki
  useEffect(() => {
    if (!open || !anchor) {
      return;
    }
    const handleResize = () => setValinta(choosePlacement(anchor));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, anchor]);

  const handleClose = (e: React.SyntheticEvent<Element, Event> | Event) => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <StyleWrapper>
      <Backdrop
        sx={{ backgroundColor: 'transparent', zIndex: 2 }}
        open={open}
        onClick={handleClose}
      />
      <Tooltip
        open={open}
        onClose={handleClose}
        slotProps={{
          popper: {
            disablePortal: true,
          },
          tooltip: {
            sx: {
              // Ilman tätä tooltip voi jäädä kapeaksi, koska disablePortalin takia se asemoidaan
              // ikonin kapean kääre-elementin suhteen. Leveyttä rajoittaa yhä maxWidth.
              width: 'max-content',
              // Tooltip ei saa ulottua ikkunan oikean reunan yli, joten leveys rajataan myös
              // ikonin oikealle puolelle jäävään tilaan
              maxWidth:
                availableWidth == null
                  ? (maxWidth ?? DEFAULT_MAX_WIDTH)
                  : `min(${maxWidth ?? DEFAULT_MAX_WIDTH}, ${availableWidth}px)`,
            },
          },
        }}
        placement={placement}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        arrow
        title={
          // Sulkemispainike omassa sarakkeessaan, jottei teksti rivity sen alle
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box sx={{ padding: 1, flex: 1, minWidth: 0 }}>{title}</Box>
            <OphButton
              sx={{ color: ophColors.black, flexShrink: 0 }}
              aria-label={t('yleinen.sulje')}
              onClick={handleClose}
              startIcon={<CloseIcon />}
            />
          </Box>
        }
      >
        <Button
          aria-label={ariaLabel ?? t('yleinen.lisatietoja')}
          sx={{
            '&.MuiButton-root': {
              padding: 0,
              margin: 0,
              minWidth: 0,
              flexShrink: 0,
              height: '24px',
              width: '24px',
              marginLeft: 1,
            },
            '& .MuiButton-startIcon': {
              margin: 0,
            },
          }}
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            // Valitaan puoli ja mitataan tila avaushetkellä, jotta tooltip on heti oikealla puolella
            // ja oikean levyinen
            setAnchor(e.currentTarget);
            setValinta(choosePlacement(e.currentTarget));
            setOpen((isOpen) => !isOpen);
          }}
          startIcon={<InfoOutlined />}
          onFocus={(e) => e.stopPropagation()}
        />
      </Tooltip>
    </StyleWrapper>
  );
};
