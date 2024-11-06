'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { notLarge } from '@/app/lib/theme';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { useParams } from 'next/navigation';
import { LeftPanel } from '@/app/components/left-panel';
import { HenkiloList } from './henkilo-list';
import { HenkiloSearch } from './henkilo-search';

export const HenkiloPanel = ({ hakuOid }: { hakuOid: string }) => {
  const theme = useTheme();
  const isLarge = !useMediaQuery(notLarge(theme));
  const hakemusOid = useParams().hakemusOid;

  const [isOpen, setIsOpen] = useState(() => isLarge || !hakemusOid);
  return (
    <LeftPanel isOpen={isOpen} setIsOpen={setIsOpen}>
      <HenkiloSearch />
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HenkiloList
          hakuOid={hakuOid}
          onItemClick={() => {
            if (!isLarge) {
              setIsOpen(false);
            }
          }}
        />
      </QuerySuspenseBoundary>
    </LeftPanel>
  );
};
