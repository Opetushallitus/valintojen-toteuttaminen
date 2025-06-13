'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { notLarge } from '@/lib/theme';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { useParams } from 'next/navigation';
import { LeftPanel } from '@/components/left-panel';
import { HakukohdeList } from './hakukohde-list';
import { HakukohdeSearchControls } from './hakukohde-search-controls';

export const HakukohdePanel = ({ hakuOid }: { hakuOid: string }) => {
  const theme = useTheme();
  const isLarge = !useMediaQuery(notLarge(theme));
  const hakukohdeOid = useParams().hakukohde;
  const [isOpen, setIsOpen] = useState(() => isLarge || !hakukohdeOid);

  return (
    <LeftPanel isOpen={isOpen} setIsOpen={setIsOpen}>
      <HakukohdeSearchControls hakuOid={hakuOid} />
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HakukohdeList
          hakuOid={hakuOid}
          onItemClick={() => {
            if (!isLarge) {
              setIsOpen(true);
            }
          }}
        />
      </QuerySuspenseBoundary>
    </LeftPanel>
  );
};
