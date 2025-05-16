'use client';

import { FormGroup, FormLabel, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { notLarge } from '@/lib/theme';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { useParams } from 'next/navigation';
import { LeftPanel } from '@/components/left-panel';
import { HakukohdeSearch } from './hakukohde-search';
import { HakukohdeList } from './hakukohde-list';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHakukohdeSearchParams } from '@/hooks/useHakukohdeSearch';

export const HakukohdePanel = ({ hakuOid }: { hakuOid: string }) => {
  const theme = useTheme();
  const isLarge = !useMediaQuery(notLarge(theme));
  const hakukohdeOid = useParams().hakukohde;
  const [isOpen, setIsOpen] = useState(() => isLarge || !hakukohdeOid);
  const { t } = useTranslations();

  const { withValintakoe, setWithValintakoe } = useHakukohdeSearchParams();
  const filtersLabel = 'hakukohde-filters-label';

  return (
    <LeftPanel isOpen={isOpen} setIsOpen={setIsOpen}>
      <HakukohdeSearch />
      <FormLabel id={filtersLabel}>
        {t('haku.hakukohde-suodattimet-otsikko')}
      </FormLabel>
      <FormGroup aria-labelledby={filtersLabel}>
        <OphCheckbox
          label={t('haku.on-valintakoe')}
          checked={withValintakoe}
          onChange={() => setWithValintakoe((checked) => !checked)}
        />
      </FormGroup>
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
