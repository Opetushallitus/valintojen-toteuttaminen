'use client';
import { Box } from '@mui/material';
import { AccordionBox } from '@/components/accordion-box';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { SijoittelunTulosAccordionTitle } from './sijoittelun-tulos-accordion-title';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { SijoittelunTulosForm } from './sijoittelun-tulos-form';

export const SijoittelunTulosContent = ({
  valintatapajono,
  haku,
  hakukohde,
  sijoitteluajoId,
  lastModified,
}: {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  lastModified: string;
}) => {
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <AccordionBox
        id={valintatapajono.oid}
        title={
          <SijoittelunTulosAccordionTitle
            valintatapajono={valintatapajono}
            haku={haku}
          />
        }
      >
        <SijoittelunTulosForm
          valintatapajono={valintatapajono}
          haku={haku}
          hakukohde={hakukohde}
          sijoitteluajoId={sijoitteluajoId}
          lastModified={lastModified}
        />
      </AccordionBox>
    </Box>
  );
};
