'use client';
import { Box } from '@mui/material';
import { HakukohteenHakijaryhma } from '@/app/lib/valintalaskenta-service';
import React from 'react';
import { HakijaryhmaAccordion } from './hakijaryhma-accordion';
import { HakijaryhmaAccordionTitle } from './hakijaryhma-accordion-title';
import { HakijaryhmaTable } from './hakijaryhma-table';

export const HakijaryhmaContent = ({
  hakijaryhma,
}: {
  hakijaryhma: HakukohteenHakijaryhma;
}) => {
  return (
    <Box width="100%">
      <HakijaryhmaAccordion
        id={hakijaryhma.oid}
        title={<HakijaryhmaAccordionTitle hakijaryhma={hakijaryhma} />}
      >
        <HakijaryhmaTable hakijat={hakijaryhma.hakijat} />
      </HakijaryhmaAccordion>
    </Box>
  );
};
