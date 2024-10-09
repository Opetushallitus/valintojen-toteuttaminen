'use client';

import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { Box, InputAdornment, OutlinedInput } from '@mui/material';
import {
  HakemuksenHarkinnanvaraisuus,
  useHarkinnanvaraisetHakemukset,
} from './hooks/useHakinnanvaraisetHakemukset';
import { HarkinnanvaraisetTable } from './components/harkinnanvaraiset-table';
import { FormBox } from '@/app/components/form-box';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ChangeEvent } from 'react';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useHarkinnanvaraisetSearchParams } from './hooks/useHarkinnanvaraisetSearchParams';
import { Search } from '@mui/icons-material';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { useHarkinnanvaraisetPaginationQueryParams } from './hooks/useHarkinnanvaraisetPaginated';

export const HarkinnanvaraisetSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHarkinnanvaraisetSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <OphFormControl
      label={t('harkinnanvaraiset.hae')}
      sx={{
        minWidth: '380px',
        textAlign: 'left',
      }}
      renderInput={({ labelId }) => (
        <OutlinedInput
          inputProps={{ 'aria-labelledby': labelId }}
          defaultValue={searchPhrase}
          onChange={handleSearchChange}
          endAdornment={
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          }
        />
      )}
    />
  );
};

const HarkinnanvaraisetForm = ({
  harkinnanvaraisetHakemukset,
}: {
  harkinnanvaraisetHakemukset: Array<HakemuksenHarkinnanvaraisuus>;
}) => {
  const { t } = useTranslations();
  return (
    <FormBox
      autoComplete="off"
      sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}
    >
      <OphButton
        variant="contained"
        type="submit"
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      <HarkinnanvaraisetTable data={harkinnanvaraisetHakemukset} />
    </FormBox>
  );
};

const HarkinnanvaraisetContent = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const harkinnanvaraisetHakemukset = useHarkinnanvaraisetHakemukset({
    hakuOid,
    hakukohdeOid,
  });

  const { pageSize, setPageSize } = useHarkinnanvaraisetPaginationQueryParams();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <HarkinnanvaraisetSearch />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      <HarkinnanvaraisetForm
        harkinnanvaraisetHakemukset={harkinnanvaraisetHakemukset}
      />
    </Box>
  );
};

export default function HarkinnanvaraisetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HarkinnanvaraisetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
