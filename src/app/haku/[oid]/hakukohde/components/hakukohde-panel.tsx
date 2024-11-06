'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { notLarge } from '@/app/lib/theme';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { useParams } from 'next/navigation';
import { LeftPanel } from '@/app/components/left-panel';
import { HakukohdeSearch } from './hakukohde-search';
import { HakukohdeList } from './hakukohde-list';

export const HakukohdePanel = ({ hakuOid }: { hakuOid: string }) => {
  const theme = useTheme();
  const isLarge = !useMediaQuery(notLarge(theme));
  const hakukohdeOid = useParams().hakukohde;
  const [isOpen, setIsOpen] = useState(() => isLarge || !hakukohdeOid);

  return (
    <LeftPanel isOpen={isOpen} setIsOpen={setIsOpen}>
      <HakukohdeSearch />
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
