'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { notLarge } from '@/lib/theme';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { LeftPanel } from '@/components/left-panel';
import { ValintaryhmaSearch } from './valintaryhma-search';
import { ValintaryhmaList } from './valintaryhma-list';
import { useParams } from 'next/navigation';

export const ValintaryhmaPanel = ({ hakuOid }: { hakuOid: string }) => {
  const theme = useTheme();
  const isLarge = !useMediaQuery(notLarge(theme));
  const valintaryhma = useParams().valintaryhma;

  const [isOpen, setIsOpen] = useState(() => isLarge || !valintaryhma);

  return (
    <LeftPanel isOpen={isOpen} setIsOpen={setIsOpen}>
      <ValintaryhmaSearch />
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintaryhmaList
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
