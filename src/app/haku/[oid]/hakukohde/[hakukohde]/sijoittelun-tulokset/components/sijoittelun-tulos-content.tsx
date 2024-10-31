'use client';
import { Box } from '@mui/material';
import { AccordionBox } from '@/app/components/accordion-box';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosAccordionTitle } from './sijoittelun-tulos-accordion-title';
import { Haku } from '@/app/lib/types/kouta-types';
import { SijoittelunTulosForm } from './sijoittelun-tulos-form';

export const SijoittelunTulosContent = ({
  valintatapajono,
  haku,
  hakukohdeOid,
  lastModified,
  publishAllowed,
}: {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
  hakukohdeOid: string;
  lastModified: string;
  publishAllowed: boolean;
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
          hakukohdeOid={hakukohdeOid}
          lastModified={lastModified}
          publishAllowed={publishAllowed}
        />
      </AccordionBox>
    </Box>
  );
};
